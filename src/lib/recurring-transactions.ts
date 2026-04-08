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

function balanceDelta(type: 'income' | 'expense' | 'transfer' | 'sale', amount: number) {
  if (type === 'transfer') return 0;
  return type === 'income' || type === 'sale' ? amount : -amount;
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

    let nextDate = src.next_recurring_date;

    // Generate all due occurrences (could be multiple if user hasn't visited in a while)
    while (nextDate <= today) {
      await db.insert(transactionsTable).values({
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
        await db.update(accountsTable)
          .set({ balance: sql`${accountsTable.balance} + ${balanceDelta(src.type, src.amount)}` })
          .where(eq(accountsTable.id, src.account_id));
      }

      generated++;
      nextDate = advanceDate(nextDate, src.recurring_pattern as RecurringPattern);
    }

    // Advance the source transaction's next_recurring_date
    await db.update(transactionsTable)
      .set({ next_recurring_date: nextDate })
      .where(eq(transactionsTable.id, src.id));
  }

  return generated;
}
