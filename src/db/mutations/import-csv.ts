'use server';

import { db } from '@/index';
import { accountsTable, transactionsTable } from '@/db/schema';
import { revalidateDomains } from '@/lib/revalidate';
import { eq, sql } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/auth';
import { requireOwnership } from '@/lib/ownership';
import { checkBudgetAlerts } from '@/lib/budget-alerts';
import { encryptForUser, getUserKey } from '@/lib/encryption';
import { fetchUserRules, matchAgainstRules } from '@/lib/auto-categorise';
import { getAllMerchantMappings } from '@/db/queries/merchant-mappings';
import { normaliseMerchant } from '@/lib/merchant-normalise';
import { isLikelyRefund } from '@/lib/refund-matcher';

// Inline HTML stripping for CSV descriptions (matches sanitize.ts behavior)
function stripHtml(raw: string, maxLength = 255): string {
  return raw.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, '').trim().slice(0, maxLength);
}

type CsvColumnMapping = {
  date: number;
  description: number;
  amount: number;            // single amount column (ignored when moneyInCol/moneyOutCol are set)
  type: number | null;       // column index for type, or null if using sign of amount
  dateFormat?: 'DMY' | 'MDY'; // disambiguates DD/MM/YYYY vs MM/DD/YYYY (default: DMY)
  moneyInCol?: number | null;  // split-column mode: column for incoming amounts (Monzo "Money In")
  moneyOutCol?: number | null; // split-column mode: column for outgoing amounts (Monzo "Money Out")
};

type ImportRow = {
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'refund';
};

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current.trim());
  return fields;
}

function parseCSV(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  return lines.map(parseCSVLine);
}

function normaliseDate(raw: string, dateFormat: 'DMY' | 'MDY' = 'DMY'): string | null {
  // Try ISO format first: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  // Match patterns like 01/02/2024, 1-2-2024, 01.02.2024
  const parts = raw.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/);
  if (parts) {
    const [, a, b, y] = parts;
    const first = parseInt(a, 10);
    const second = parseInt(b, 10);

    if (dateFormat === 'MDY') {
      // Treat as MM/DD/YYYY — but if month > 12, swap to DMY as fallback
      const month = first > 12 ? second : first;
      const day = first > 12 ? first : second;
      return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // Default: DMY — treat as DD/MM/YYYY, but if day > 12 and month <= 12, swap as fallback
    const day = first > 31 ? second : first;
    const month = first > 31 ? first : second;
    return `${y}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // Try Date.parse as fallback
  const parsed = new Date(raw);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return null;
}

function parseAmount(raw: string): number | null {
  // Remove currency symbols and whitespace
  const cleaned = raw.replace(/[£$€\s,]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

export async function importTransactionsFromCSV(
  csvText: string,
  mapping: CsvColumnMapping,
  accountId: string,
  defaultType: 'income' | 'expense' | 'auto',
): Promise<{ imported: number; skipped: number; errors: string[]; transactionIds: string[] }> {
  const MAX_CSV_BYTES = 5_000_000; // 5 MB
  const MAX_DATA_ROWS = 10_000;

  if (csvText.length > MAX_CSV_BYTES) {
    return { imported: 0, skipped: 0, errors: [`CSV too large (${(csvText.length / 1_000_000).toFixed(1)} MB). Maximum is 5 MB.`], transactionIds: [] };
  }

  const userId = await getCurrentUserId();

  await requireOwnership(accountsTable, accountId, userId, 'account');

  const allRows = parseCSV(csvText);
  if (allRows.length < 2) {
    return { imported: 0, skipped: 0, errors: ['CSV must have a header row and at least one data row.'], transactionIds: [] };
  }

  if (allRows.length - 1 > MAX_DATA_ROWS) {
    return { imported: 0, skipped: 0, errors: [`CSV has ${allRows.length - 1} rows. Maximum is ${MAX_DATA_ROWS}.`], transactionIds: [] };
  }

  // Skip header row
  const dataRows = allRows.slice(1);
  const errors: string[] = [];
  const validRows: ImportRow[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + 2; // 1-indexed, accounting for header

    const rawDate = row[mapping.date];
    const rawDesc = row[mapping.description];

    // Split-column mode: use Money In / Money Out columns instead of single amount
    const useSplitColumns =
      mapping.moneyInCol != null && mapping.moneyOutCol != null;

    let rawAmount: string;
    let splitType: 'income' | 'expense' | null = null;

    if (useSplitColumns) {
      const rawIn = (row[mapping.moneyInCol!] ?? '').trim();
      const rawOut = (row[mapping.moneyOutCol!] ?? '').trim();
      const parsedIn = rawIn ? parseAmount(rawIn) : null;
      const parsedOut = rawOut ? parseAmount(rawOut) : null;
      const hasIn = parsedIn !== null && parsedIn !== 0;
      const hasOut = parsedOut !== null && parsedOut !== 0;

      if (hasIn) {
        rawAmount = rawIn;
        splitType = 'income';
      } else if (hasOut) {
        rawAmount = rawOut;
        splitType = 'expense';
      } else {
        // Both empty or zero — skip row
        errors.push(`Row ${rowNum}: No amount in Money In or Money Out columns.`);
        continue;
      }
    } else {
      rawAmount = row[mapping.amount];
    }

    if (!rawDate || !rawDesc || !rawAmount) {
      errors.push(`Row ${rowNum}: Missing required fields.`);
      continue;
    }

    const date = normaliseDate(rawDate, mapping.dateFormat);
    if (!date) {
      errors.push(`Row ${rowNum}: Could not parse date "${rawDate}".`);
      continue;
    }

    const amount = parseAmount(rawAmount);
    if (amount === null || amount === 0) {
      errors.push(`Row ${rowNum}: Invalid amount "${rawAmount}".`);
      continue;
    }

    let type: 'income' | 'expense' | 'refund';
    if (splitType) {
      // Split-column mode: type is derived from which column had the value
      type = splitType;
    } else if (mapping.type !== null) {
      const rawType = (row[mapping.type] ?? '').toLowerCase().trim();
      if (rawType === 'refund') {
        type = 'refund';
      } else if (rawType === 'income' || rawType === 'credit' || rawType === 'cr' || rawType === 'money in') {
        type = 'income';
      } else if (rawType === 'expense' || rawType === 'debit' || rawType === 'dr' || rawType === 'money out') {
        type = 'expense';
      } else {
        type = 'expense';
      }
    } else if (defaultType === 'auto') {
      type = amount > 0 ? 'income' : 'expense';
    } else {
      type = defaultType;
    }

    // Auto-detect refund from description keywords when type is income or auto
    if (type === 'income' && isLikelyRefund(rawDesc)) {
      type = 'refund';
    }

    validRows.push({
      date,
      description: stripHtml(rawDesc, 255) || rawDesc.substring(0, 255),
      amount: Math.abs(amount),
      type,
    });
  }

  if (validRows.length === 0) {
    return {
      imported: 0,
      skipped: dataRows.length,
      errors: errors.slice(0, 20),
      transactionIds: [],
    };
  }

  // Fetch categorisation rules, merchant mappings, and user encryption key once
  const [rules, merchantMappings, userKey] = await Promise.all([
    fetchUserRules(userId),
    getAllMerchantMappings(userId),
    getUserKey(userId),
  ]);

  // Build all insert values in memory
  let totalBalanceDelta = 0;
  const insertValues = validRows.map((row) => {
    const merchantName = normaliseMerchant(row.description);

    // Priority: rules → merchant mapping → uncategorised
    let categoryId = matchAgainstRules(rules, row.description);
    let categorySource: string | null = categoryId ? 'rule' : null;

    if (!categoryId && merchantName) {
      const merchantLower = merchantName.toLowerCase();
      const mapping = merchantMappings.find(
        (m) => m.merchant.toLowerCase() === merchantLower,
      );
      if (mapping?.category_id) {
        categoryId = mapping.category_id;
        categorySource = 'merchant';
      }
    }

    const delta = row.type === 'income' || row.type === 'refund' ? row.amount : -row.amount;
    totalBalanceDelta += delta;

    return {
      user_id: userId,
      account_id: accountId,
      category_id: categoryId,
      category_source: categorySource,
      merchant_name: merchantName,
      type: row.type,
      amount: row.amount,
      description: encryptForUser(row.description, userKey),
      date: row.date,
      is_recurring: false as const,
      recurring_pattern: null,
      next_recurring_date: null,
    };
  });

  // Batch insert all rows + update balance in a single transaction
  const BATCH_SIZE = 500;
  const insertedIds: string[] = [];
  await db.transaction(async (tx) => {
    for (let i = 0; i < insertValues.length; i += BATCH_SIZE) {
      const batch = await tx.insert(transactionsTable).values(insertValues.slice(i, i + BATCH_SIZE)).returning({ id: transactionsTable.id });
      insertedIds.push(...batch.map((r) => r.id));
    }

    if (totalBalanceDelta !== 0) {
      await tx
        .update(accountsTable)
        .set({ balance: sql`${accountsTable.balance} + ${totalBalanceDelta}` })
        .where(eq(accountsTable.id, accountId));
    }
  });

  const imported = validRows.length;

  revalidateDomains('transactions', 'accounts');

  await checkBudgetAlerts(userId);

  return {
    imported,
    skipped: dataRows.length - imported,
    errors: errors.slice(0, 20), // Cap error messages
    transactionIds: insertedIds,
  };
}
