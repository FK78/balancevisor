'use server';

import { db } from '@/index';
import { zakatSettingsTable, zakatCalculationsTable } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/auth';
import { calculateZakat } from '@/lib/zakat';
import { getZakatSettings } from '@/db/queries/zakat';
import { z } from 'zod';
import { parseFormData, zRequiredDate, zEnum, zCheckbox } from '@/lib/form-schema';

const zakatSettingsSchema = z.object({
  anniversary_date: zRequiredDate(),
  nisab_type: zEnum(['gold', 'silver'] as const, 'gold'),
  use_lunar_calendar: zCheckbox(),
});

export async function saveZakatSettings(formData: FormData) {
  const userId = await getCurrentUserId();
  const { anniversary_date: anniversaryDate, nisab_type: nisabType, use_lunar_calendar: useLunarCalendar } = parseFormData(zakatSettingsSchema, formData);

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
    other_assets_value: breakdown.otherAssetsValue,
    total_liabilities: breakdown.totalLiabilities,
    debt_deductions: breakdown.debtDeductions,
    zakatable_amount: breakdown.zakatableAmount,
    zakat_due: breakdown.zakatDue,
    above_nisab: breakdown.aboveNisab,
    breakdown_json: JSON.stringify({
      accounts: breakdown.accounts,
      otherAssets: breakdown.otherAssets,
    }),
  });

  revalidatePath('/dashboard/zakat');
  return breakdown;
}
