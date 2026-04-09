import { db } from '@/index';
import { transactionsTable, accountsTable } from '@/db/schema';
import { eq, and, lte, isNotNull, sql } from 'drizzle-orm';

type RecurringPattern = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

function advanceDate(dateStr: string, pattern: RecurringPattern): string {
  const d = new Date(dateStr + 'T00:00:00');
  switch (pattern) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'biweekly':
      d.setDate(d.getDate() + 14);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + 1);
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d.toISOString().split('T')[0];
}

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

  let generated = 0;

  for (const src of dueRecurring) {
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
        nextDate = advanceDate(nextDate, src.recurring_pattern as RecurringPattern);
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
