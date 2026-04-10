'use server';

import { db } from '@/index';
import { zakatSettingsTable, zakatCalculationsTable } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/auth';
import { calculateZakat } from '@/lib/zakat';
import { getZakatSettings } from '@/db/queries/zakat';
import { requireDate, sanitizeEnum, formString } from '@/lib/sanitize';

export async function saveZakatSettings(formData: FormData) {
  const userId = await getCurrentUserId();
  const anniversaryDate = requireDate(formString(formData, 'anniversary_date'), 'Anniversary date');
  const nisabType = sanitizeEnum(formString(formData, 'nisab_type'), ['gold', 'silver'] as const, 'gold');
  const useLunarCalendar = formData.get('use_lunar_calendar') === 'on';

  await db.insert(zakatSettingsTable).values({
    user_id: userId,
    anniversary_date: anniversaryDate,
    nisab_type: nisabType,
    use_lunar_calendar: useLunarCalendar,
  }).onConflictDoUpdate({
    target: zakatSettingsTable.user_id,
    set: {
      anniversary_date: anniversaryDate,
      nisab_type: nisabType,
      use_lunar_calendar: useLunarCalendar,
      updated_at: new Date(),
    },
  });

  revalidatePath('/dashboard/zakat');
}

export async function triggerZakatCalculation(isAuto = false) {
  const userId = await getCurrentUserId();
  const settings = await getZakatSettings(userId);
  const nisabType = settings?.nisab_type ?? 'gold';

  const breakdown = await calculateZakat(userId, nisabType);

  await db.insert(zakatCalculationsTable).values({
    user_id: userId,
    is_auto: isAuto,
    nisab_value: breakdown.nisabValue,
    total_assets: breakdown.totalAssets,
    cash_and_savings: breakdown.cashAndSavings,
    investment_value: breakdown.investmentValue,
    total_liabilities: breakdown.totalLiabilities,
    debt_deductions: breakdown.debtDeductions,
    zakatable_amount: breakdown.zakatableAmount,
    zakat_due: breakdown.zakatDue,
    above_nisab: breakdown.aboveNisab,
    breakdown_json: {
      accounts: breakdown.accounts,
      debts: breakdown.debts,
    },
  });

  revalidatePath('/dashboard/zakat');
  return breakdown;
}
