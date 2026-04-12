import { v1Handler, dataResponse } from "@/lib/api-v1";
import { calculateZakat } from "@/lib/zakat";
import { getZakatSettings } from "@/db/queries/zakat";

export const POST = v1Handler(async ({ userId }) => {
  const settings = await getZakatSettings(userId);
  const nisabType = settings?.nisab_type ?? "gold";
  const breakdown = await calculateZakat(userId, nisabType);
  return dataResponse(breakdown);
});
