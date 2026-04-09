import { getZakatSettings, getLatestZakatCalculation } from '@/db/queries/zakat';
import { triggerZakatCalculation } from '@/db/mutations/zakat';

/**
 * If the user's zakat anniversary is tomorrow (or today/past and no recent calc),
 * auto-trigger a zakat calculation. Called from the dashboard layout.
 */
export async function autoCalculateZakatIfDue(userId: string): Promise<void> {
  const settings = await getZakatSettings(userId);
  if (!settings) return;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Build this year's anniversary date (normalize to midnight for comparison)
  const anniv = new Date(settings.anniversary_date);
  const thisYearAnniv = new Date(now.getFullYear(), anniv.getMonth(), anniv.getDate());
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // If this year's anniversary already passed (strictly before today), look at next year
  if (thisYearAnniv.getTime() < todayMidnight.getTime()) {
    thisYearAnniv.setFullYear(thisYearAnniv.getFullYear() + 1);
  }

  // Calculate days until anniversary using midnight-normalized dates
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntil = Math.round((thisYearAnniv.getTime() - todayMidnight.getTime()) / msPerDay);

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
