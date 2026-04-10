import { db } from '@/index';
import { transactionsTable, accountsTable } from '@/db/schema';
import { eq, and, lte, isNotNull, sql, inArray } from 'drizzle-orm';
import { decryptForUser, getUserKey } from '@/lib/encryption';
import { computeNextRecurringDate, type RecurringPattern } from '@/lib/recurring-utils';
import { normalise } from '@/lib/matching-utils';
import { logger } from '@/lib/logger';

function balanceDelta(type: 'income' | 'expense' | 'transfer' | 'sale' | 'refund', amount: number) {
  if (type === 'transfer') return 0;
  return type === 'income' || type === 'sale' || type === 'refund' ? amount : -amount;
}

/**
 * Finds all recurring transactions where next_recurring_date <= today,
 * generates the due occurrences as new transactions, updates account
 * balances, and advances next_recurring_date on the source.
 * Returns the count of generated transactions.
 */
export async function generateDueRecurringTransactions(userId: string): Promise<number> {
  const today = new Date().toISOString().split('T')[0];

  const dueRecurring = await db
    .select({
      id: transactionsTable.id,
      account_id: transactionsTable.account_id,
      category_id: transactionsTable.category_id,
      type: transactionsTable.type,
      amount: transactionsTable.amount,
      description: transactionsTable.description,
      is_recurring: transactionsTable.is_recurring,
      recurring_pattern: transactionsTable.recurring_pattern,
      next_recurring_date: transactionsTable.next_recurring_date,
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(transactionsTable.is_recurring, true),
        isNotNull(transactionsTable.recurring_pattern),
        isNotNull(transactionsTable.next_recurring_date),
        lte(transactionsTable.next_recurring_date, today),
      )
    );

  if (dueRecurring.length === 0) return 0;

  // ---------------------------------------------------------------------------
  // Deduplicate: the old enrichment pipeline marked ALL historical transactions
  // for the same charge as recurring.  We only want to generate from one source
  // per unique charge.  Decrypt descriptions to group, keep the latest per key.
  // ---------------------------------------------------------------------------
  const userKey = await getUserKey(userId);
  const seen = new Map<string, typeof dueRecurring[number]>();
  const duplicateIds: string[] = [];

  for (const src of dueRecurring) {
    if (!src.recurring_pattern || !src.next_recurring_date) continue;
    const desc = src.description ? decryptForUser(src.description, userKey) : '';
    const key = normalise(desc) + '|' + src.type;
    const existing = seen.get(key);
    if (!existing || (src.next_recurring_date > (existing.next_recurring_date ?? ''))) {
      if (existing) duplicateIds.push(existing.id);
      seen.set(key, src);
    } else {
      duplicateIds.push(src.id);
    }
  }

  // Self-heal: unmark duplicate sources so they stop being picked up
  if (duplicateIds.length > 0) {
    logger.info('recurring-gen', `Unmarking ${duplicateIds.length} duplicate recurring sources`);
    await db.update(transactionsTable)
      .set({ is_recurring: false, recurring_pattern: null, next_recurring_date: null })
      .where(inArray(transactionsTable.id, duplicateIds));
  }

  const sources = Array.from(seen.values());
  let generated = 0;

  for (const src of sources) {
    if (!src.recurring_pattern || !src.next_recurring_date) continue;

    // Wrap in a transaction to prevent duplicate generation when two
    // concurrent requests (e.g. two tabs) process the same source.
    // The CAS on next_recurring_date ensures only one wins.
    await db.transaction(async (tx) => {
      // Re-read inside the transaction to get the authoritative date
      const [fresh] = await tx
        .select({ next_recurring_date: transactionsTable.next_recurring_date })
        .from(transactionsTable)
        .where(eq(transactionsTable.id, src.id));

      if (!fresh?.next_recurring_date || fresh.next_recurring_date > today) return;

      let nextDate = fresh.next_recurring_date;

      // Generate all due occurrences (could be multiple if user hasn't visited in a while)
      while (nextDate <= today) {
        await tx.insert(transactionsTable).values({
          user_id: userId,
          account_id: src.account_id,
          category_id: src.category_id,
          type: src.type,
          amount: src.amount,
          description: src.description,
          date: nextDate,
          is_recurring: false,
          recurring_pattern: null,
          next_recurring_date: null,
        });

        // Update account balance
        if (src.account_id) {
          await tx.update(accountsTable)
            .set({ balance: sql`${accountsTable.balance} + ${balanceDelta(src.type, src.amount)}` })
            .where(eq(accountsTable.id, src.account_id));
        }

        generated++;
        nextDate = computeNextRecurringDate(nextDate, src.recurring_pattern as RecurringPattern);
      }

      // Advance the source transaction's next_recurring_date atomically.
      // CAS: only update if next_recurring_date hasn't changed (prevents double-generation).
      await tx.update(transactionsTable)
        .set({ next_recurring_date: nextDate })
        .where(
          and(
            eq(transactionsTable.id, src.id),
            eq(transactionsTable.next_recurring_date, fresh.next_recurring_date),
          ),
        );
    });
  }

  return generated;
}
