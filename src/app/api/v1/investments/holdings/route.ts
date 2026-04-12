import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { manualHoldingsTable } from "@/db/schema";
import { v1Handler, dataResponse, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import { getManualHoldings } from "@/db/queries/investments";
import { getQuote } from "@/lib/yahoo-finance";
import { revalidateDomains } from "@/lib/revalidate";

const createHoldingSchema = z.object({
  investment_type: z.enum(["stock", "crypto", "etf", "real_estate", "private_equity", "other"]).default("stock"),
  ticker: z.string().max(20).nullable().optional().default(null),
  name: z.string().min(1).max(255),
  quantity: z.number().min(0.0001),
  average_price: z.number().min(0),
  currency: z.enum(["GBP", "USD", "EUR"]).default("GBP"),
  account_id: z.string().uuid().nullable().optional().default(null),
  group_id: z.string().uuid().nullable().optional().default(null),
  estimated_return_percent: z.number().nullable().optional().default(null),
  notes: z.string().max(500).nullable().optional().default(null),
});

export const GET = v1Handler(async ({ userId }) => {
  const holdings = await getManualHoldings(userId);
  return dataResponse(holdings);
});

export const POST = v1Handler(async ({ userId, req }) => {
  const body = await parseJsonBody(req, createHoldingSchema);
  if (body instanceof NextResponse) return body;

  const ticker = body.ticker?.toUpperCase() ?? null;
  let currentPrice: number | null = null;
  let lastPriceUpdate: Date | null = null;

  if (body.investment_type === "stock" && ticker) {
    const quote = await getQuote(ticker);
    if (quote) {
      currentPrice = quote.currentPrice;
      lastPriceUpdate = new Date();
    }
  }

  const [result] = await db.insert(manualHoldingsTable).values({
    user_id: userId,
    ticker,
    name: body.name,
    quantity: body.quantity,
    average_price: body.average_price,
    current_price: currentPrice,
    currency: body.currency,
    investment_type: body.investment_type,
    estimated_return_percent: body.estimated_return_percent,
    notes: body.notes,
    account_id: body.account_id,
    group_id: body.group_id,
    last_price_update: lastPriceUpdate,
  }).returning({ id: manualHoldingsTable.id });

  revalidateDomains("investments");
  return mutationResponse({ id: result.id }, 201);
});
