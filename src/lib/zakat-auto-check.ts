import { getZakatSettings, getLatestZakatCalculation } from '@/db/queries/zakat';
import { triggerZakatCalculation } from '@/db/mutations/zakat';

/**
 * If the user's zakat anniversary is tomorrow (or today/past and no recent calc),
 * auto-trigger a zakat calculation. Called from the dashboard layout.
 */
export async function autoCalculateZakatIfDue(userId: string): Promise<void> {
  const settings = await getZakatSettings(userId);
  if (!settings) return;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Build this year's anniversary date
  const anniv = new Date(settings.anniversary_date);
  const thisYearAnniv = new Date(today.getFullYear(), anniv.getMonth(), anniv.getDate());

  // If this year's anniversary already passed, look at next year
  if (thisYearAnniv < today) {
    thisYearAnniv.setFullYear(thisYearAnniv.getFullYear() + 1);
  }

  // Calculate days until anniversary
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntil = Math.ceil((thisYearAnniv.getTime() - today.getTime()) / msPerDay);

  // Only auto-calculate if anniversary is tomorrow or today
  if (daysUntil > 1) return;

  // Check if we already have a calculation for today
  const latest = await getLatestZakatCalculation(userId);
  if (latest) {
    const latestDate = new Date(latest.calculated_at).toISOString().split('T')[0];
    if (latestDate === todayStr) return; // already calculated today
  }

  // Trigger auto-calculation
  await triggerZakatCalculation(true);
}
