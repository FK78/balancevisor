import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { retirementProfilesTable } from "@/db/schema";
import { v1Handler, dataResponse, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import { getRetirementProfile } from "@/db/queries/retirement";
import { revalidateDomains } from "@/lib/revalidate";

const retirementSchema = z.object({
  current_age: z.number().int().min(16).max(100),
  target_retirement_age: z.number().int().min(17).max(120),
  desired_annual_spending: z.number().min(0),
  expected_pension_annual: z.number().min(0),
  expected_investment_return: z.number().min(-10).max(30),
  inflation_rate: z.number().min(0).max(20),
  life_expectancy: z.number().int().min(18).max(120),
}).refine((d) => d.target_retirement_age > d.current_age, {
  message: "Target retirement age must be greater than current age",
  path: ["target_retirement_age"],
}).refine((d) => d.life_expectancy > d.target_retirement_age, {
  message: "Life expectancy must be greater than target retirement age",
  path: ["life_expectancy"],
});

export const GET = v1Handler(async ({ userId }) => {
  const profile = await getRetirementProfile(userId);
  return dataResponse(profile);
});

export const POST = v1Handler(async ({ userId, req }) => {
  const body = await parseJsonBody(req, retirementSchema);
  if (body instanceof NextResponse) return body;

  await db.insert(retirementProfilesTable).values({
    user_id: userId,
    current_age: body.current_age,
    target_retirement_age: body.target_retirement_age,
    desired_annual_spending: body.desired_annual_spending,
    expected_pension_annual: body.expected_pension_annual,
    expected_investment_return: body.expected_investment_return,
    inflation_rate: body.inflation_rate,
    life_expectancy: body.life_expectancy,
    updated_at: new Date(),
  }).onConflictDoUpdate({
    target: retirementProfilesTable.user_id,
    set: {
      current_age: body.current_age,
      target_retirement_age: body.target_retirement_age,
      desired_annual_spending: body.desired_annual_spending,
      expected_pension_annual: body.expected_pension_annual,
      expected_investment_return: body.expected_investment_return,
      inflation_rate: body.inflation_rate,
      life_expectancy: body.life_expectancy,
      updated_at: new Date(),
    },
  });

  revalidateDomains("retirement");
  return mutationResponse({ success: true }, 201);
});
