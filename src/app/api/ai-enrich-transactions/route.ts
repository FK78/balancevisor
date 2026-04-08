import { getCurrentUserId } from "@/lib/auth";
import { enrichTransactions } from "@/lib/transaction-intelligence";
import { rateLimiters } from "@/lib/rate-limiter";
import { z } from "zod";

const bodySchema = z.object({
  transactionIds: z.array(z.string().uuid()).optional(),
});

export async function POST(req: Request) {
  const userId = await getCurrentUserId();

  const rateLimitResult = rateLimiters.serverAction.consume(
    `ai-enrich:${userId}`,
  );
  if (!rateLimitResult.allowed) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimitResult.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const result = await enrichTransactions(userId, parsed.data.transactionIds);

  return Response.json(result);
}
