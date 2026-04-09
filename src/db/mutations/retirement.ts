'use server';

import { db } from '@/index';
import { retirementProfilesTable } from '@/db/schema';
import { getCurrentUserId } from '@/lib/auth';
import { sanitizeNumber } from '@/lib/sanitize';
import { revalidateDomains } from '@/lib/revalidate';
import { invalidateByUser } from '@/lib/cache';

export async function upsertRetirementProfile(formData: FormData) {
  const userId = await getCurrentUserId();

  const currentAge = sanitizeNumber(
    formData.get('current_age') as string,
    'Current age',
    { required: true, min: 16, max: 100 },
  );
  const targetRetirementAge = sanitizeNumber(
    formData.get('target_retirement_age') as string,
    'Target retirement age',
    { required: true, min: currentAge + 1, max: 120 },
  );
  const desiredAnnualSpending = sanitizeNumber(
    formData.get('desired_annual_spending') as string,
    'Desired annual spending',
    { required: true, min: 0 },
  );
  const expectedPensionAnnual = sanitizeNumber(
    formData.get('expected_pension_annual') as string,
    'Expected pension',
    { required: false, min: 0 },
  ) ?? 0;
  const expectedInvestmentReturn = sanitizeNumber(
    formData.get('expected_investment_return') as string,
    'Expected investment return',
    { required: false, min: -10, max: 30 },
  ) ?? 5.0;
  const inflationRate = sanitizeNumber(
    formData.get('inflation_rate') as string,
    'Inflation rate',
    { required: false, min: 0, max: 20 },
  ) ?? 2.5;
  const lifeExpectancy = sanitizeNumber(
    formData.get('life_expectancy') as string,
    'Life expectancy',
    { required: false, min: targetRetirementAge + 1, max: 120 },
  ) ?? 90;

  await db.insert(retirementProfilesTable).values({
    user_id: userId,
    current_age: currentAge,
    target_retirement_age: targetRetirementAge,
    desired_annual_spending: desiredAnnualSpending,
    expected_pension_annual: expectedPensionAnnual,
    expected_investment_return: expectedInvestmentReturn,
    inflation_rate: inflationRate,
    life_expectancy: lifeExpectancy,
    updated_at: new Date(),
  }).onConflictDoUpdate({
    target: retirementProfilesTable.user_id,
    set: {
      current_age: currentAge,
      target_retirement_age: targetRetirementAge,
      desired_annual_spending: desiredAnnualSpending,
      expected_pension_annual: expectedPensionAnnual,
      expected_investment_return: expectedInvestmentReturn,
      inflation_rate: inflationRate,
      life_expectancy: lifeExpectancy,
      updated_at: new Date(),
    },
  });

  invalidateByUser(userId);
  revalidateDomains('retirement');
}
