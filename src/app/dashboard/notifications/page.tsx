import { getCurrentUserId } from "@/lib/auth";
import { getAllNotifications } from "@/db/queries/budget-alerts";
import { getPendingReviewFlags } from "@/db/queries/review-flags";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { NotificationsPageClient } from "@/components/NotificationsPageClient";

export default async function NotificationsPage() {
  const userId = await getCurrentUserId();

  const [reviewFlags, budgetNotifications, currency] = await Promise.all([
    getPendingReviewFlags(userId),
    getAllNotifications(userId, 50),
    getUserBaseCurrency(userId),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-10">
      <NotificationsPageClient
        reviewFlags={reviewFlags}
        budgetNotifications={budgetNotifications}
        currency={currency}
      />
    </main>
  );
}
