import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { savePageLayout, deletePageLayout } from "@/db/mutations/dashboard-layouts";
import { getPageLayout } from "@/db/queries/dashboard-layouts";
import { PAGE_WIDGETS, type DashboardPageId } from "@/lib/widget-registry";
import { rateLimiters } from "@/lib/rate-limiter";
import { logger } from "@/lib/logger";
import { badRequest, rateLimited, handleApiError } from "@/lib/api-errors";

const layoutItemSchema = z.object({
  widgetId: z.string(),
  visible: z.boolean(),
  colSpan: z.union([z.literal(1), z.literal(2)]).optional(),
});

const saveLayoutSchema = z.object({
  page: z.string(),
  layout: z.array(layoutItemSchema).max(50),
});

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const page = req.nextUrl.searchParams.get("page") as DashboardPageId | null;

    if (!page || !(page in PAGE_WIDGETS)) {
      return badRequest("Invalid page");
    }

    const layout = await getPageLayout(userId, page);
    return NextResponse.json({ layout });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    const rl = rateLimiters.dashboardLayout.consume(`layout-save:${userId}`);
    if (!rl.allowed) {
      return rateLimited(rl.retryAfter);
    }

    const body = await req.json();
    const parsed = saveLayoutSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.issues.map((i) => i.message).join(", "));
    }

    const { page, layout } = parsed.data;
    if (!(page in PAGE_WIDGETS)) {
      return badRequest("Invalid page");
    }

    await savePageLayout(userId, page as DashboardPageId, layout);
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("dashboard-layout", "POST failed", error);
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    const rl = rateLimiters.dashboardLayout.consume(`layout-delete:${userId}`);
    if (!rl.allowed) {
      return rateLimited(rl.retryAfter);
    }

    const page = req.nextUrl.searchParams.get("page") as DashboardPageId | null;

    if (!page || !(page in PAGE_WIDGETS)) {
      return badRequest("Invalid page");
    }

    await deletePageLayout(userId, page);
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error("dashboard-layout", "DELETE failed", error);
    return handleApiError(error);
  }
}
