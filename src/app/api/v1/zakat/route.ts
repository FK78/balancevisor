import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { zakatSettingsTable } from "@/db/schema";
import { v1Handler, dataResponse, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import { getZakatSettings, getLatestZakatCalculation, getZakatCalculations } from "@/db/queries/zakat";
import { revalidateDomains } from "@/lib/revalidate";

const zakatSettingsSchema = z.object({
  anniversary_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nisab_type: z.enum(["gold", "silver"]).default("gold"),
  use_lunar_calendar: z.boolean().default(false),
});

export const GET = v1Handler(async ({ userId }) => {
  const [settings, latest, history] = await Promise.all([
    getZakatSettings(userId),
    getLatestZakatCalculation(userId),
    getZakatCalculations(userId, 10),
  ]);
  return dataResponse({ settings, latest, history });
});

export const POST = v1Handler(async ({ userId, req }) => {
  const body = await parseJsonBody(req, zakatSettingsSchema);
  if (body instanceof NextResponse) return body;

  await db.insert(zakatSettingsTable).values({
    user_id: userId,
    anniversary_date: body.anniversary_date,
    nisab_type: body.nisab_type,
    use_lunar_calendar: body.use_lunar_calendar,
  }).onConflictDoUpdate({
    target: zakatSettingsTable.user_id,
    set: {
      anniversary_date: body.anniversary_date,
      nisab_type: body.nisab_type,
      use_lunar_calendar: body.use_lunar_calendar,
      updated_at: new Date(),
    },
  });

  revalidateDomains("zakat");
  return mutationResponse({ success: true }, 201);
});
