/**
 * Check if the user has a zakat anniversary due and trigger auto-calculation.
 */
import { getZakatSettings } from "@/db/queries/zakat";
import { triggerZakatCalculation } from "@/db/mutations/zakat";
import { logger } from "@/lib/logger";

export async function autoCalculateZakatIfDue(userId: string): Promise<void> {
  try {
    const settings = await getZakatSettings(userId);
    if (!settings?.anniversary_date) return;

    const today = new Date();
    const anniversary = new Date(settings.anniversary_date);
    const isDue =
      today.getMonth() === anniversary.getMonth() &&
      today.getDate() === anniversary.getDate();

    if (isDue) {
      await triggerZakatCalculation(true);
    }
  } catch (err) {
    logger.warn("zakat-auto-check", "auto zakat failed", { error: String(err) });
  }
}
