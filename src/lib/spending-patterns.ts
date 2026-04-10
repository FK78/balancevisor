// ---------------------------------------------------------------------------
// Spending-pattern detectors for Funny Milestone Cards
// Pure functions — no DB, no AI, no side-effects.
// ---------------------------------------------------------------------------

export interface PatternTransaction {
  readonly merchant_name: string | null;
  readonly category: string | null;
  readonly amount: number;
  readonly date: string;
  readonly type: string | null;
}

// ---------------------------------------------------------------------------
// Pattern types
// ---------------------------------------------------------------------------

interface TopMerchantPattern {
  readonly type: "top_merchant";
  readonly merchant: string;
  readonly count: number;
  readonly total: number;
}

interface BiggestSpenderPattern {
  readonly type: "biggest_spender";
  readonly merchant: string;
  readonly pct: number;
  readonly total: number;
}

interface CategoryFlipPattern {
  readonly type: "category_flip";
  readonly bigger: string;
  readonly smaller: string;
  readonly biggerAmt: number;
  readonly smallerAmt: number;
}

interface WeekendWarriorPattern {
  readonly type: "weekend_warrior";
  readonly pct: number;
  readonly total: number;
}

interface SubCollectorPattern {
  readonly type: "sub_collector";
  readonly count: number;
  readonly monthly: number;
}

interface CoffeeAddictPattern {
  readonly type: "coffee_addict";
  readonly count: number;
  readonly total: number;
}

interface MicroSpenderPattern {
  readonly type: "micro_spender";
  readonly count: number;
  readonly total: number;
}

export type SpendingPattern =
  | TopMerchantPattern
  | BiggestSpenderPattern
  | CategoryFlipPattern
  | WeekendWarriorPattern
  | SubCollectorPattern
  | CoffeeAddictPattern
  | MicroSpenderPattern;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgoDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function isExpense(tx: PatternTransaction): boolean {
  return tx.type === "expense" && tx.amount > 0;
}

function isWeekend(dateStr: string): boolean {
  const d = new Date(dateStr);
  const dow = d.getDay();
  return dow === 0 || dow === 6;
}

const COFFEE_MERCHANTS = new Set([
  "costa coffee", "starbucks", "pret a manger", "caffe nero",
  "black sheep coffee", "nero", "costa", "pret",
]);

function isCoffeeMerchant(merchant: string | null): boolean {
  if (!merchant) return false;
  const lower = merchant.toLowerCase();
  for (const kw of COFFEE_MERCHANTS) {
    if (lower.includes(kw)) return true;
  }
  return lower.includes("coffee");
}

// ---------------------------------------------------------------------------
// Individual detectors
// ---------------------------------------------------------------------------

function topMerchantByCount(txns: readonly PatternTransaction[]): TopMerchantPattern | null {
  const cutoff = daysAgoDate(90);
  const counts = new Map<string, { count: number; total: number }>();

  for (const tx of txns) {
    if (!isExpense(tx) || !tx.merchant_name || tx.date < cutoff) continue;
    const key = tx.merchant_name;
    const existing = counts.get(key) ?? { count: 0, total: 0 };
    counts.set(key, { count: existing.count + 1, total: existing.total + tx.amount });
  }

  let best: { merchant: string; count: number; total: number } | null = null;
  for (const [merchant, data] of counts) {
    if (data.count >= 15 && (!best || data.count > best.count)) {
      best = { merchant, ...data };
    }
  }

  return best ? { type: "top_merchant", ...best } : null;
}

function topMerchantBySpend(txns: readonly PatternTransaction[]): BiggestSpenderPattern | null {
  const cutoff = daysAgoDate(90);
  const totals = new Map<string, number>();
  let totalExpenses = 0;

  for (const tx of txns) {
    if (!isExpense(tx) || tx.date < cutoff) continue;
    totalExpenses += tx.amount;
    if (!tx.merchant_name) continue;
    totals.set(tx.merchant_name, (totals.get(tx.merchant_name) ?? 0) + tx.amount);
  }

  if (totalExpenses === 0) return null;

  let best: { merchant: string; total: number; pct: number } | null = null;
  for (const [merchant, total] of totals) {
    const pct = Math.round((total / totalExpenses) * 100);
    if (pct >= 20 && (!best || pct > best.pct)) {
      best = { merchant, total: Math.round(total * 100) / 100, pct };
    }
  }

  return best ? { type: "biggest_spender", ...best } : null;
}

const FLIP_PAIRS: readonly [string, string][] = [
  ["Dining Out", "Groceries"],
  ["Entertainment", "Education"],
  ["Shopping", "Bills & Utilities"],
];

function categoryVsCategory(txns: readonly PatternTransaction[]): CategoryFlipPattern | null {
  const cutoff = daysAgoDate(90);
  const catTotals = new Map<string, number>();

  for (const tx of txns) {
    if (!isExpense(tx) || !tx.category || tx.date < cutoff) continue;
    catTotals.set(tx.category, (catTotals.get(tx.category) ?? 0) + tx.amount);
  }

  for (const [expected_smaller, expected_bigger] of FLIP_PAIRS) {
    const smallerAmt = catTotals.get(expected_bigger) ?? 0;
    const biggerAmt = catTotals.get(expected_smaller) ?? 0;
    if (biggerAmt > smallerAmt && smallerAmt > 0) {
      return {
        type: "category_flip",
        bigger: expected_smaller,
        smaller: expected_bigger,
        biggerAmt: Math.round(biggerAmt * 100) / 100,
        smallerAmt: Math.round(smallerAmt * 100) / 100,
      };
    }
  }

  return null;
}

function weekendWarrior(txns: readonly PatternTransaction[]): WeekendWarriorPattern | null {
  const cutoff = daysAgoDate(30);
  let weekendTotal = 0;
  let total = 0;

  for (const tx of txns) {
    if (!isExpense(tx) || tx.date < cutoff) continue;
    total += tx.amount;
    if (isWeekend(tx.date)) weekendTotal += tx.amount;
  }

  if (total === 0) return null;
  const pct = Math.round((weekendTotal / total) * 100);
  if (pct < 40) return null;

  return { type: "weekend_warrior", pct, total: Math.round(weekendTotal * 100) / 100 };
}

function coffeeAddict(txns: readonly PatternTransaction[]): CoffeeAddictPattern | null {
  const cutoff = daysAgoDate(30);
  let count = 0;
  let total = 0;

  for (const tx of txns) {
    if (!isExpense(tx) || tx.date < cutoff) continue;
    if (isCoffeeMerchant(tx.merchant_name) || (tx.category === "Dining Out" && tx.amount < 7 && /coffee/i.test(tx.merchant_name ?? ""))) {
      count++;
      total += tx.amount;
    }
  }

  if (count < 10) return null;
  return { type: "coffee_addict", count, total: Math.round(total * 100) / 100 };
}

function microSpender(txns: readonly PatternTransaction[]): MicroSpenderPattern | null {
  const cutoff = daysAgoDate(30);
  let count = 0;
  let total = 0;

  for (const tx of txns) {
    if (!isExpense(tx) || tx.date < cutoff) continue;
    if (tx.amount < 5) {
      count++;
      total += tx.amount;
    }
  }

  if (count < 20) return null;
  return { type: "micro_spender", count, total: Math.round(total * 100) / 100 };
}

// ---------------------------------------------------------------------------
// Subscription collector (separate input)
// ---------------------------------------------------------------------------

export interface SubscriptionInput {
  readonly count: number;
  readonly monthlyTotal: number;
}

function subscriptionCollector(subs: SubscriptionInput | null): SubCollectorPattern | null {
  if (!subs || subs.count < 8) return null;
  return { type: "sub_collector", count: subs.count, monthly: Math.round(subs.monthlyTotal * 100) / 100 };
}

// ---------------------------------------------------------------------------
// Interestingness score (for sorting)
// ---------------------------------------------------------------------------

function interestingness(p: SpendingPattern): number {
  switch (p.type) {
    case "top_merchant": return p.count * 2;
    case "biggest_spender": return p.pct * 3;
    case "category_flip": return 60;
    case "weekend_warrior": return p.pct;
    case "sub_collector": return p.count * 5;
    case "coffee_addict": return p.count * 3;
    case "micro_spender": return p.count * 2;
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function detectSpendingPatterns(
  txns: readonly PatternTransaction[],
  subs: SubscriptionInput | null = null,
): readonly SpendingPattern[] {
  const results: SpendingPattern[] = [];

  const a = topMerchantByCount(txns);
  if (a) results.push(a);

  const b = topMerchantBySpend(txns);
  if (b) results.push(b);

  const c = categoryVsCategory(txns);
  if (c) results.push(c);

  const d = weekendWarrior(txns);
  if (d) results.push(d);

  const e = subscriptionCollector(subs);
  if (e) results.push(e);

  const f = coffeeAddict(txns);
  if (f) results.push(f);

  const g = microSpender(txns);
  if (g) results.push(g);

  // Sort by interestingness, return top 3
  results.sort((x, y) => interestingness(y) - interestingness(x));
  return results.slice(0, 3);
}
