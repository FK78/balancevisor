import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { savePageLayout, deletePageLayout } from "@/db/mutations/dashboard-layouts";
import { getPageLayout } from "@/db/queries/dashboard-layouts";
import { PAGE_WIDGETS, type DashboardPageId, type WidgetLayoutItem } from "@/lib/widget-registry";

export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const page = req.nextUrl.searchParams.get("page") as DashboardPageId | null;

    if (!page || !(page in PAGE_WIDGETS)) {
      return NextResponse.json({ error: "Invalid page" }, { status: 400 });
    }

    const layout = await getPageLayout(userId, page);
    return NextResponse.json({ layout });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const body = await req.json();
    const { page, layout } = body as { page: DashboardPageId; layout: WidgetLayoutItem[] };

    if (!page || !(page in PAGE_WIDGETS)) {
      return NextResponse.json({ error: "Invalid page" }, { status: 400 });
    }

    if (!Array.isArray(layout)) {
      return NextResponse.json({ error: "Invalid layout" }, { status: 400 });
    }

    await savePageLayout(userId, page, layout);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    const page = req.nextUrl.searchParams.get("page") as DashboardPageId | null;

    if (!page || !(page in PAGE_WIDGETS)) {
      return NextResponse.json({ error: "Invalid page" }, { status: 400 });
    }

    await deletePageLayout(userId, page);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
