import { db } from "@/index";
import {
  transactionReviewFlagsTable,
  transactionsTable,
  subscriptionsTable,
  debtsTable,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { decryptForUser, getUserKey } from "@/lib/encryption";

export type ReviewFlag = {
  id: string;
  transaction_id: string;
  flag_type: "subscription_amount_mismatch" | "possible_debt_payment" | "possible_subscription";
  transactionDescription: string;
  transactionAmount: number;
  transactionDate: string | null;
  expected_amount: number | null;
  actual_amount: number;
  subscriptionName: string | null;
  debtName: string | null;
  created_at: Date;
};

export async function getPendingReviewFlags(
  userId: string,
): Promise<ReviewFlag[]> {
  try {
    const rows = await db
      .select({
        id: transactionReviewFlagsTable.id,
        transaction_id: transactionReviewFlagsTable.transaction_id,
        flag_type: transactionReviewFlagsTable.flag_type,
        expected_amount: transactionReviewFlagsTable.expected_amount,
        actual_amount: transactionReviewFlagsTable.actual_amount,
        created_at: transactionReviewFlagsTable.created_at,
        transactionDescription: transactionsTable.description,
        transactionAmount: transactionsTable.amount,
        transactionDate: transactionsTable.date,
        subscriptionName: subscriptionsTable.name,
        debtName: debtsTable.name,
      })
      .from(transactionReviewFlagsTable)
      .innerJoin(
        transactionsTable,
        eq(transactionReviewFlagsTable.transaction_id, transactionsTable.id),
      )
      .leftJoin(
        subscriptionsTable,
        eq(
          transactionReviewFlagsTable.suggested_subscription_id,
          subscriptionsTable.id,
        ),
      )
      .leftJoin(
        debtsTable,
        eq(transactionReviewFlagsTable.suggested_debt_id, debtsTable.id),
      )
      .where(
        and(
          eq(transactionReviewFlagsTable.user_id, userId),
          eq(transactionReviewFlagsTable.is_resolved, false),
        ),
      )
      .orderBy(desc(transactionReviewFlagsTable.created_at));

    const userKey = await getUserKey(userId);
    return rows.map((r) => ({
      ...r,
      transactionDescription: r.transactionDescription
        ? decryptForUser(r.transactionDescription, userKey)
        : "",
    }));
  } catch (error) {
    console.error("getPendingReviewFlags failed (table may not exist yet):", error);
    return [];
  }
}

export async function getPendingReviewFlagCount(
  userId: string,
): Promise<number> {
  try {
    const rows = await db
      .select({ id: transactionReviewFlagsTable.id })
      .from(transactionReviewFlagsTable)
      .where(
        and(
          eq(transactionReviewFlagsTable.user_id, userId),
          eq(transactionReviewFlagsTable.is_resolved, false),
        ),
      );
    return rows.length;
  } catch (error) {
    console.error("getPendingReviewFlagCount failed (table may not exist yet):", error);
    return 0;
  }
}
