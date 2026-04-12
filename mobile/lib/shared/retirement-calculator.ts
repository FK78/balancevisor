// Portable version — inline type replaces server RetirementProfile import

export interface RetirementProfile {
  readonly current_age: number;
  readonly target_retirement_age: number;
  readonly desired_annual_spending: number;
  readonly expected_pension_annual: number;
  readonly expected_investment_return: number;
  readonly inflation_rate: number;
  readonly life_expectancy: number;
}

export interface RetirementInputs {
  readonly profile: RetirementProfile;
  readonly currentNetWorth: number;
  readonly investmentValue: number;
  readonly annualSavings: number;
  readonly totalDebtRemaining: number;
  readonly avgMonthlyIncome: number;
  readonly avgMonthlyExpenses: number;
}

export interface RetirementScenario {
  readonly label: string;
  readonly description: string;
  readonly estimatedRetirementAge: number;
  readonly yearsToRetirement: number;
  readonly projectedFundAtRetirement: number;
}

export interface YearlyProjectionPoint {
  readonly age: number;
  readonly year: number;
  readonly projectedFund: number;
  readonly requiredFund: number;
}

export interface RetirementProjection {
  readonly estimatedRetirementAge: number;
  readonly yearsToRetirement: number;
  readonly targetRetirementAge: number;
  readonly canRetireOnTarget: boolean;
  readonly requiredFundAtTarget: number;
  readonly projectedFundAtTarget: number;
  readonly fundGap: number;
  readonly fundProgress: number;
  readonly currentNetWorth: number;
  readonly annualSavings: number;
  readonly monthlySavings: number;
  readonly savingsRate: number;
  readonly yearlyProjection: readonly YearlyProjectionPoint[];
  readonly scenarios: readonly RetirementScenario[];
}

function calculateRequiredFund(
  desiredAnnualSpending: number,
  pensionAnnual: number,
  realReturnRate: number,
  yearsInRetirement: number,
): number {
  const annualNeed = Math.max(0, desiredAnnualSpending - pensionAnnual);
  if (annualNeed <= 0) return 0;
  if (realReturnRate === 0) return annualNeed * yearsInRetirement;
  const factor = (1 - Math.pow(1 + realReturnRate, -yearsInRetirement)) / realReturnRate;
  return annualNeed * factor;
}

function projectFund(
  currentFund: number,
  annualContribution: number,
  realReturnRate: number,
  years: number,
): number {
  if (years <= 0) return currentFund;
  if (realReturnRate === 0) return currentFund + annualContribution * years;
  const growthFactor = Math.pow(1 + realReturnRate, years);
  const contributionFV = annualContribution * ((growthFactor - 1) / realReturnRate);
  return currentFund * growthFactor + contributionFV;
}

function findRetirementAge(
  currentAge: number,
  currentFund: number,
  annualContribution: number,
  realReturnRate: number,
  desiredAnnualSpending: number,
  pensionAnnual: number,
  lifeExpectancy: number,
  maxAge: number = 100,
): number {
  for (let age = currentAge + 1; age <= maxAge; age++) {
    const years = age - currentAge;
    const projected = projectFund(currentFund, annualContribution, realReturnRate, years);
    const yearsInRetirement = Math.max(1, lifeExpectancy - age);
    const required = calculateRequiredFund(desiredAnnualSpending, pensionAnnual, realReturnRate, yearsInRetirement);
    if (projected >= required) return age;
  }
  return maxAge;
}

function buildYearlyProjection(
  currentAge: number,
  currentFund: number,
  annualContribution: number,
  realReturnRate: number,
  desiredAnnualSpending: number,
  pensionAnnual: number,
  lifeExpectancy: number,
  targetAge: number,
): readonly YearlyProjectionPoint[] {
  const currentYear = new Date().getFullYear();
  const endAge = Math.max(targetAge + 5, lifeExpectancy);
  const points: YearlyProjectionPoint[] = [];

  for (let age = currentAge; age <= endAge; age++) {
    const years = age - currentAge;
    const projected = projectFund(currentFund, annualContribution, realReturnRate, years);
    const yearsInRetirement = Math.max(1, lifeExpectancy - age);
    const required = calculateRequiredFund(desiredAnnualSpending, pensionAnnual, realReturnRate, yearsInRetirement);
    points.push({
      age,
      year: currentYear + years,
      projectedFund: Math.round(projected),
      requiredFund: Math.round(required),
    });
  }

  return points;
}

export function calculateRetirementProjection(inputs: RetirementInputs): RetirementProjection {
  const { profile, currentNetWorth, annualSavings, avgMonthlyIncome, avgMonthlyExpenses } = inputs;

  const realReturnRate = (profile.expected_investment_return - profile.inflation_rate) / 100;
  const currentFund = Math.max(0, currentNetWorth);
  const yearsToTarget = Math.max(0, profile.target_retirement_age - profile.current_age);
  const yearsInRetirement = Math.max(1, profile.life_expectancy - profile.target_retirement_age);

  const requiredFundAtTarget = calculateRequiredFund(
    profile.desired_annual_spending, profile.expected_pension_annual, realReturnRate, yearsInRetirement,
  );
  const projectedFundAtTarget = projectFund(currentFund, annualSavings, realReturnRate, yearsToTarget);

  const fundGap = requiredFundAtTarget - projectedFundAtTarget;
  const fundProgress = requiredFundAtTarget > 0
    ? Math.min(100, Math.round((projectedFundAtTarget / requiredFundAtTarget) * 100))
    : 100;

  const estimatedRetirementAge = findRetirementAge(
    profile.current_age, currentFund, annualSavings, realReturnRate,
    profile.desired_annual_spending, profile.expected_pension_annual, profile.life_expectancy,
  );

  const canRetireOnTarget = estimatedRetirementAge <= profile.target_retirement_age;

  const yearlyProjection = buildYearlyProjection(
    profile.current_age, currentFund, annualSavings, realReturnRate,
    profile.desired_annual_spending, profile.expected_pension_annual, profile.life_expectancy,
    profile.target_retirement_age,
  );

  const savingsRate = avgMonthlyIncome > 0
    ? Math.round(((avgMonthlyIncome - avgMonthlyExpenses) / avgMonthlyIncome) * 100)
    : 0;

  const scenarios: RetirementScenario[] = [];

  const boostedSavings = annualSavings * 1.2;
  const boostedAge = findRetirementAge(
    profile.current_age, currentFund, boostedSavings, realReturnRate,
    profile.desired_annual_spending, profile.expected_pension_annual, profile.life_expectancy,
  );
  scenarios.push({
    label: "Save 20% more",
    description: `Increase monthly savings by ${Math.round((annualSavings * 0.2) / 12)} to ${Math.round(boostedSavings / 12)}/month`,
    estimatedRetirementAge: boostedAge,
    yearsToRetirement: Math.max(0, boostedAge - profile.current_age),
    projectedFundAtRetirement: Math.round(projectFund(currentFund, boostedSavings, realReturnRate, boostedAge - profile.current_age)),
  });

  const reducedSpending = profile.desired_annual_spending * 0.85;
  const reducedAge = findRetirementAge(
    profile.current_age, currentFund, annualSavings, realReturnRate,
    reducedSpending, profile.expected_pension_annual, profile.life_expectancy,
  );
  scenarios.push({
    label: "Spend 15% less in retirement",
    description: `Target ${Math.round(reducedSpending)} instead of ${Math.round(profile.desired_annual_spending)}/year`,
    estimatedRetirementAge: reducedAge,
    yearsToRetirement: Math.max(0, reducedAge - profile.current_age),
    projectedFundAtRetirement: Math.round(projectFund(currentFund, annualSavings, realReturnRate, reducedAge - profile.current_age)),
  });

  const higherReturn = realReturnRate + 0.01;
  const higherReturnAge = findRetirementAge(
    profile.current_age, currentFund, annualSavings, higherReturn,
    profile.desired_annual_spending, profile.expected_pension_annual, profile.life_expectancy,
  );
  scenarios.push({
    label: "+1% investment return",
    description: `If real returns are ${((realReturnRate + 0.01) * 100).toFixed(1)}% instead of ${(realReturnRate * 100).toFixed(1)}%`,
    estimatedRetirementAge: higherReturnAge,
    yearsToRetirement: Math.max(0, higherReturnAge - profile.current_age),
    projectedFundAtRetirement: Math.round(projectFund(currentFund, annualSavings, higherReturn, higherReturnAge - profile.current_age)),
  });

  return {
    estimatedRetirementAge,
    yearsToRetirement: Math.max(0, estimatedRetirementAge - profile.current_age),
    targetRetirementAge: profile.target_retirement_age,
    canRetireOnTarget,
    requiredFundAtTarget: Math.round(requiredFundAtTarget),
    projectedFundAtTarget: Math.round(projectedFundAtTarget),
    fundGap: Math.round(fundGap),
    fundProgress,
    currentNetWorth: Math.round(currentNetWorth),
    annualSavings: Math.round(annualSavings),
    monthlySavings: Math.round(annualSavings / 12),
    savingsRate,
    yearlyProjection,
    scenarios,
  };
}
