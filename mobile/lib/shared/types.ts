/**
 * Shared types for API responses — mirrors the server-side DB schema shapes
 * without importing server dependencies.
 */

export interface Account {
  id: string;
  name: string;
  type: "current" | "savings" | "credit" | "investment" | "cash" | "mortgage" | "loan" | "other";
  balance: number;
  currency: string;
  institution: string;
  color: string;
  lastSynced: string | null;
}

export interface Transaction {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  type: "income" | "expense" | "refund";
  date: string;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
  merchant: string | null;
  notes: string | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
  isDefault: boolean;
}

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  budgetSpent: number;
  color: string;
  period: string;
}

export interface Debt {
  id: string;
  name: string;
  type: "credit_card" | "personal_loan" | "student_loan" | "mortgage" | "car_loan" | "other";
  total_amount: number;
  remaining_amount: number;
  interest_rate: number;
  minimum_payment: number;
  due_date: string | null;
  lender: string;
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  target_date: string | null;
  icon: string;
  color: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billing_cycle: "monthly" | "yearly" | "weekly" | "quarterly";
  next_billing_date: string;
  category: string | null;
  is_active: boolean;
}

export interface Holding {
  id: string;
  ticker: string;
  name: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  currency: string;
  type: "stock" | "etf" | "crypto" | "bond" | "other";
  broker: string;
}

export interface DashboardSummary {
  accounts: Account[];
  budgets: Budget[];
  goals: Goal[];
  debts: Debt[];
  subscriptionTotals: { monthly: number; yearly: number };
  totals: { income: number; expenses: number };
  netWorth: Array<{ date: string; net_worth: number }>;
  baseCurrency: string;
  onboardingCompleted: boolean;
}

export interface HealthScoreResponse {
  overall: number;
  grade: "A" | "B" | "C" | "D" | "F";
  subScores: Array<{
    label: string;
    score: number;
    maxScore: number;
    description: string;
  }>;
}

export interface Nudge {
  key: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical" | "celebration";
  category: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
