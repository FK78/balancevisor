import { getCurrentUserId } from "@/lib/auth";
import { getAllNotifications, getUnreadCount } from "@/db/queries/budget-alerts";
import { getPendingReviewFlagCount } from "@/db/queries/review-flags";
import { NotificationBell } from "./NotificationBell";

export async function NotificationBellServer() {
  const userId = await getCurrentUserId();
  const [notifications, unreadCount, reviewFlagCount] = await Promise.all([
    getAllNotifications(userId, 20),
    getUnreadCount(userId),
    getPendingReviewFlagCount(userId),
  ]);

  return (
    <NotificationBell
      notifications={notifications}
      unreadCount={unreadCount}
      reviewFlagCount={reviewFlagCount}
    />
  );
}
