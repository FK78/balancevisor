import { getTransactionsForExport, type ExportTransaction } from "@/db/queries/transactions";
import { getCurrentUserId } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { getPostHogClient } from "@/lib/posthog-server";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string | null): value is string {
  if (!value || !ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  return !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function escapeCsvValue(value: string | number | boolean | null) {
  if (value === null || value === undefined) {
    return "";
  }

  return `"${String(value).replace(/"/g, "\"\"")}"`;
}

function buildCsv(rows: ExportTransaction[]) {
  const header = [
    "ID",
    "Date",
    "Type",
    "Amount",
    "Description",
    "Account",
    "Category",
    "Recurring",
    "Transfer To Account ID",
  ];

  const lines = [header.map(escapeCsvValue).join(",")];

  for (const row of rows) {
    lines.push([
      row.id,
      row.date,
      row.type,
      row.amount,
      row.description,
      row.accountName,
      row.category,
      row.isRecurring,
      row.transferAccountId,
    ].map(escapeCsvValue).join(","));
  }

  return `\uFEFF${lines.join("\n")}`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
    return NextResponse.json(
      { error: "startDate and endDate must use YYYY-MM-DD format." },
      { status: 400 },
    );
  }

  if (startDate > endDate) {
    return NextResponse.json(
      { error: "startDate must be before or equal to endDate." },
      { status: 400 },
    );
  }

  let userId: string;
  try {
    userId = await getCurrentUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const rows = await getTransactionsForExport(userId, startDate, endDate);
  const csv = buildCsv(rows);
  const fileName = `transactions_${startDate}_to_${endDate}.csv`;

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: userId,
    event: "transactions_exported",
    properties: {
      start_date: startDate,
      end_date: endDate,
      row_count: rows.length,
    },
  });

  return new NextResponse(csv, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
