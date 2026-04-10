'use server';

import { db } from '@/index';
import {
  accountsTable,
  budgetAlertPreferencesTable,
  budgetsTable,
  categoriesTable,
  categorisationRulesTable,
  debtsTable,
  debtPaymentsTable,
  goalsTable,
  holdingSalesTable,
  investmentGroupsTable,
  manualHoldingsTable,
  netWorthSnapshotsTable,
  subscriptionsTable,
  transactionsTable,
  transactionSplitsTable,
} from '@/db/schema';
import { getCurrentUserId } from '@/lib/auth';
import { encryptForUser, getUserKey } from '@/lib/encryption';
import { revalidateDomains } from '@/lib/revalidate';
import { EXPORT_VERSION } from '@/lib/types';
import type { ExportData } from '@/lib/types';
import { randomUUID } from 'crypto';

type ImportSummary = {
  imported: Record<string, number>;
  skipped: Record<string, number>;
  errors: string[];
};

const BATCH_SIZE = 500;

function validateExportShape(data: unknown): data is ExportData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  if (typeof d.version !== 'number') return false;
  if (typeof d.exported_at !== 'string') return false;

  const requiredArrays = [
    'accounts', 'categories', 'transactions', 'transactionSplits',
    'budgets', 'budgetAlertPreferences', 'goals', 'debts',
    'debtPayments', 'investmentGroups', 'manualHoldings', 'holdingSales',
    'subscriptions', 'netWorthSnapshots', 'categorisationRules',
  ];
  for (const key of requiredArrays) {
    if (!Array.isArray(d[key])) return false;
  }
  return true;
}

async function insertBatch<T extends Record<string, unknown>>(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  table: Parameters<typeof tx.insert>[0],
  rows: T[],
): Promise<number> {
  if (rows.length === 0) return 0;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (tx.insert(table).values(batch as any) as any).onConflictDoNothing();
    inserted += batch.length;
  }
  return inserted;
}

export async function importUserData(
  raw: unknown,
): Promise<ImportSummary> {
  if (!validateExportShape(raw)) {
    return {
      imported: {},
      skipped: {},
      errors: ['Invalid export file format. Please use a file exported from BalanceVisor.'],
    };
  }

  const data = raw as ExportData;

  if (data.version > EXPORT_VERSION) {
    return {
      imported: {},
      skipped: {},
      errors: [`Export version ${data.version} is newer than supported (${EXPORT_VERSION}). Please update BalanceVisor.`],
    };
  }

  const userId = await getCurrentUserId();
  const userKey = await getUserKey(userId);
  const errors: string[] = [];
  const imported: Record<string, number> = {};
  const skipped: Record<string, number> = {};

  // Build old→new ID maps so FK references stay intact with fresh UUIDs.
  // This prevents a crafted export from injecting IDs that collide with
  // other users' data.
  const idMap = new Map<string, string>();
  function remap(oldId: string): string {
    let newId = idMap.get(oldId);
    if (!newId) { newId = randomUUID(); idMap.set(oldId, newId); }
    return newId;
  }
  function remapNullable(oldId: string | null | undefined): string | null {
    if (!oldId) return null;
    return remap(oldId);
  }

  // Re-encrypt text fields with this user's key, stamp user_id, and remap IDs
  const categories = data.categories.map(c => ({
    ...c,
    id: remap(c.id),
    user_id: userId,
  }));

  const accounts = data.accounts.map(a => ({
    ...a,
    id: remap(a.id),
    user_id: userId,
    name: a.name ? encryptForUser(a.name, userKey) : a.name,
    // Strip truelayer references since connections are not exported
    truelayer_id: null,
    truelayer_connection_id: null,
  }));

  const transactions = data.transactions.map(t => ({
    ...t,
    id: remap(t.id),
    user_id: userId,
    account_id: remapNullable(t.account_id),
    category_id: remapNullable(t.category_id),
    transfer_account_id: remapNullable(t.transfer_account_id),
    subscription_id: remapNullable(t.subscription_id),
    linked_debt_id: remapNullable(t.linked_debt_id),
    refund_for_transaction_id: remapNullable(t.refund_for_transaction_id),
    description: t.description ? encryptForUser(t.description, userKey) : t.description,
  }));

  const transactionSplits = data.transactionSplits.map(s => ({
    ...s,
    id: remap(s.id),
    transaction_id: remap(s.transaction_id),
    category_id: remapNullable(s.category_id),
    description: s.description ? encryptForUser(s.description, userKey) : s.description,
  }));

  const budgets = data.budgets.map(b => ({
    ...b,
    id: remap(b.id),
    user_id: userId,
    category_id: remapNullable(b.category_id),
  }));

  const budgetAlertPreferences = data.budgetAlertPreferences.map(p => ({
    ...p,
    id: remap(p.id),
    user_id: userId,
    budget_id: remap(p.budget_id),
  }));

  const goals = data.goals.map(g => ({
    ...g,
    id: remap(g.id),
    user_id: userId,
  }));

  const debts = data.debts.map(d => ({
    ...d,
    id: remap(d.id),
    user_id: userId,
  }));

  const debtPayments = data.debtPayments.map(p => ({
    ...p,
    id: remap(p.id),
    debt_id: remap(p.debt_id),
    account_id: remap(p.account_id),
  }));

  const investmentGroups = data.investmentGroups.map(g => ({
    ...g,
    id: remap(g.id),
    user_id: userId,
    account_id: remapNullable(g.account_id),
  }));

  const manualHoldings = data.manualHoldings.map(h => ({
    ...h,
    id: remap(h.id),
    user_id: userId,
    account_id: remapNullable(h.account_id),
    group_id: remapNullable(h.group_id),
  }));

  const holdingSales = data.holdingSales.map(s => ({
    ...s,
    id: remap(s.id),
    user_id: userId,
    holding_id: remap(s.holding_id),
    cash_account_id: remapNullable(s.cash_account_id),
  }));

  const subscriptions = data.subscriptions.map(s => ({
    ...s,
    id: remap(s.id),
    user_id: userId,
    account_id: remap(s.account_id),
    category_id: remapNullable(s.category_id),
  }));

  const netWorthSnapshots = data.netWorthSnapshots.map(s => ({
    ...s,
    id: remap(s.id),
    user_id: userId,
  }));

  const categorisationRules = data.categorisationRules.map(r => ({
    ...r,
    id: remap(r.id),
    user_id: userId,
    category_id: remapNullable(r.category_id),
  }));

  try {
    await db.transaction(async (tx) => {
      // Insert order respects FK constraints
      // 1. Categories (no FK deps)
      imported.categories = await insertBatch(tx, categoriesTable, categories);
      skipped.categories = data.categories.length - imported.categories;

      // 2. Accounts (no FK deps within user data)
      imported.accounts = await insertBatch(tx, accountsTable, accounts);
      skipped.accounts = data.accounts.length - imported.accounts;

      // 3. Transactions (FK → accounts, categories)
      imported.transactions = await insertBatch(tx, transactionsTable, transactions);
      skipped.transactions = data.transactions.length - imported.transactions;

      // 4. Transaction splits (FK → transactions, categories)
      imported.transactionSplits = await insertBatch(tx, transactionSplitsTable, transactionSplits);
      skipped.transactionSplits = data.transactionSplits.length - imported.transactionSplits;

      // 5. Budgets (FK → categories)
      imported.budgets = await insertBatch(tx, budgetsTable, budgets);
      skipped.budgets = data.budgets.length - imported.budgets;

      // 6. Budget alert preferences (FK → budgets)
      imported.budgetAlertPreferences = await insertBatch(tx, budgetAlertPreferencesTable, budgetAlertPreferences);
      skipped.budgetAlertPreferences = data.budgetAlertPreferences.length - imported.budgetAlertPreferences;

      // 7. Goals (no FK deps)
      imported.goals = await insertBatch(tx, goalsTable, goals);
      skipped.goals = data.goals.length - imported.goals;

      // 8. Debts (no FK deps)
      imported.debts = await insertBatch(tx, debtsTable, debts);
      skipped.debts = data.debts.length - imported.debts;

      // 9. Debt payments (FK → debts, accounts)
      imported.debtPayments = await insertBatch(tx, debtPaymentsTable, debtPayments);
      skipped.debtPayments = data.debtPayments.length - imported.debtPayments;

      // 10. Investment groups (FK → accounts)
      imported.investmentGroups = await insertBatch(tx, investmentGroupsTable, investmentGroups);
      skipped.investmentGroups = data.investmentGroups.length - imported.investmentGroups;

      // 11. Manual holdings (FK → accounts, investment_groups)
      imported.manualHoldings = await insertBatch(tx, manualHoldingsTable, manualHoldings);
      skipped.manualHoldings = data.manualHoldings.length - imported.manualHoldings;

      // 12. Holding sales (FK → manual_holdings, accounts)
      imported.holdingSales = await insertBatch(tx, holdingSalesTable, holdingSales);
      skipped.holdingSales = data.holdingSales.length - imported.holdingSales;

      // 13. Subscriptions (FK → categories, accounts)
      imported.subscriptions = await insertBatch(tx, subscriptionsTable, subscriptions);
      skipped.subscriptions = data.subscriptions.length - imported.subscriptions;

      // 14. Net worth snapshots (no FK deps)
      imported.netWorthSnapshots = await insertBatch(tx, netWorthSnapshotsTable, netWorthSnapshots);
      skipped.netWorthSnapshots = data.netWorthSnapshots.length - imported.netWorthSnapshots;

      // 15. Categorisation rules (FK → categories)
      imported.categorisationRules = await insertBatch(tx, categorisationRulesTable, categorisationRules);
      skipped.categorisationRules = data.categorisationRules.length - imported.categorisationRules;
    });
  } catch (err) {
    errors.push(err instanceof Error ? err.message : 'An unexpected error occurred during import.');
    return { imported, skipped, errors };
  }

  revalidateDomains(
    'accounts', 'transactions', 'budgets', 'goals',
    'debts', 'subscriptions', 'investments', 'categories',
  );

  return { imported, skipped, errors };
}
