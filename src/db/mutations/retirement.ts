'use server';

import { db } from '@/index';
import { retirementProfilesTable } from '@/db/schema';
import { getCurrentUserId } from '@/lib/auth';
import { z } from 'zod';
import { parseFormData, zNumber } from '@/lib/form-schema';
import { revalidateDomains } from '@/lib/revalidate';

export async function upsertRetirementProfile(formData: FormData) {
  const userId = await getCurrentUserId();

  const retirementSchema = z.object({
    current_age: zNumber({ min: 16, max: 100 }),
    target_retirement_age: zNumber({ min: 17, max: 120 }),
    desired_annual_spending: zNumber({ min: 0 }),
    expected_pension_annual: zNumber({ min: 0 }),
    expected_investment_return: zNumber({ min: -10, max: 30 }),
    inflation_rate: zNumber({ min: 0, max: 20 }),
    life_expectancy: zNumber({ min: 18, max: 120 }),
  }).refine((d) => d.target_retirement_age > d.current_age, {
    message: 'Target retirement age must be greater than current age',
    path: ['target_retirement_age'],
  }).refine((d) => d.life_expectancy > d.target_retirement_age, {
    message: 'Life expectancy must be greater than target retirement age',
    path: ['life_expectancy'],
  });

  const data = parseFormData(retirementSchema, formData);
  const currentAge = data.current_age;
  const targetRetirementAge = data.target_retirement_age;
  const desiredAnnualSpending = data.desired_annual_spending;
  const expectedPensionAnnual = data.expected_pension_annual;
  const expectedInvestmentReturn = data.expected_investment_return;
  const inflationRate = data.inflation_rate;
  const lifeExpectancy = data.life_expectancy;

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

  revalidateDomains('retirement');
}
