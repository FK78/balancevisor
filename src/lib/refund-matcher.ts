import { db } from '@/index';
import { transactionsTable } from '@/db/schema';
import { and, eq, gte, desc } from 'drizzle-orm';
import { decryptForUser, getUserKey } from '@/lib/encryption';

// ---------------------------------------------------------------------------
// Refund keyword detection
// ---------------------------------------------------------------------------

const REFUND_KEYWORDS = [
  'refund',
  'reversal',
  'chargeback',
  'credit back',
  'returned',
  'reimbursement',
  'cashback',
] as const;

export function isLikelyRefund(description: string): boolean {
  const lower = description.toLowerCase();
  return REFUND_KEYWORDS.some((kw) => lower.includes(kw));
}

// ---------------------------------------------------------------------------
// Match a refund to an original expense
// ---------------------------------------------------------------------------

export type RefundMatch = {
  transactionId: string;
  description: string;
  amount: number;
  date: string | null;
};

/**
 * Finds a recent expense on the same account whose amount matches and whose
 * decrypted description overlaps with the refund description.
 *
 * Returns the best match or null.
 */
export async function findMatchingExpense(
  userId: string,
  accountId: string,
  amount: number,
  refundDescription: string,
): Promise<RefundMatch | null> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const cutoff = ninetyDaysAgo.toISOString().split('T')[0];

  const candidates = await db
    .select({
      id: transactionsTable.id,
      description: transactionsTable.description,
      amount: transactionsTable.amount,
      date: transactionsTable.date,
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(transactionsTable.account_id, accountId),
        eq(transactionsTable.type, 'expense'),
        eq(transactionsTable.amount, amount),
        gte(transactionsTable.date, cutoff),
      ),
    )
    .orderBy(desc(transactionsTable.date))
    .limit(20);

  if (candidates.length === 0) return null;

  const userKey = await getUserKey(userId);
  const needle = stripRefundKeywords(refundDescription).toLowerCase().trim();

  let best: RefundMatch | null = null;
  let bestScore = 0;

  for (const c of candidates) {
    const decrypted = c.description ? decryptForUser(c.description, userKey) : '';
    const hay = decrypted.toLowerCase().trim();

    const score = similarityScore(needle, hay);
    if (score > bestScore) {
      bestScore = score;
      best = {
        transactionId: c.id,
        description: decrypted,
        amount: c.amount,
        date: c.date,
      };
    }
  }

  // Require at least a 40% substring overlap to count as a match
  if (bestScore < 0.4) return null;

  return best;
}

/**
 * Search recent expenses on an account for manual refund linking.
 * Returns up to `limit` recent expenses.
 */
export async function getRecentExpensesForLinking(
  userId: string,
  accountId: string,
  limit = 20,
): Promise<RefundMatch[]> {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const cutoff = ninetyDaysAgo.toISOString().split('T')[0];

  const rows = await db
    .select({
      id: transactionsTable.id,
      description: transactionsTable.description,
      amount: transactionsTable.amount,
      date: transactionsTable.date,
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(transactionsTable.account_id, accountId),
        eq(transactionsTable.type, 'expense'),
        gte(transactionsTable.date, cutoff),
      ),
    )
    .orderBy(desc(transactionsTable.date))
    .limit(limit);

  const userKey = await getUserKey(userId);
  return rows.map((r) => ({
    transactionId: r.id,
    description: r.description ? decryptForUser(r.description, userKey) : '',
    amount: r.amount,
    date: r.date,
  }));
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripRefundKeywords(text: string): string {
  let result = text;
  for (const kw of REFUND_KEYWORDS) {
    result = result.replace(new RegExp(kw, 'gi'), '');
  }
  return result.replace(/\s+/g, ' ').trim();
}

function similarityScore(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;

  // Check if one contains the other
  if (b.includes(a) || a.includes(b)) {
    const shorter = Math.min(a.length, b.length);
    const longer = Math.max(a.length, b.length);
    return shorter / longer;
  }

  // Word overlap
  const wordsA = new Set(a.split(/\s+/).filter(Boolean));
  const wordsB = new Set(b.split(/\s+/).filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let overlap = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) overlap++;
  }

  return overlap / Math.max(wordsA.size, wordsB.size);
}
