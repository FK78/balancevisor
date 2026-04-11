import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { guardAiEnabled } from "@/lib/ai-guard";
import { rateLimiters } from "@/lib/rate-limiter";

const mappingSchema = z.object({
  dateCol: z.number().int().min(0).nullable(),
  descCol: z.number().int().min(0).nullable(),
  amountCol: z.number().int().min(0).nullable(),
  typeCol: z.number().int().min(0).nullable(),
  moneyInCol: z.number().int().min(0).nullable().optional(),
  moneyOutCol: z.number().int().min(0).nullable().optional(),
});

export async function POST(req: Request) {
  const userId = await getCurrentUserId();

  const aiBlocked = await guardAiEnabled();
  if (aiBlocked) return aiBlocked;

  const rateLimitResult = rateLimiters.serverAction.consume(`parse-csv-columns:${userId}`);
  if (!rateLimitResult.allowed) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimitResult.retryAfter) } },
    );
  }

  const { headers, sampleRows } = await req.json();

  if (!Array.isArray(headers) || !Array.isArray(sampleRows)) {
    return Response.json({ error: "Missing headers or sampleRows" }, { status: 400 });
  }

  const headerList = headers.map((h: string, i: number) => `  Column ${i}: "${h}"`).join("\n");
  const sampleList = sampleRows
    .slice(0, 3)
    .map((row: string[], ri: number) =>
      `  Row ${ri + 1}: ${row.map((cell, ci) => `Col${ci}="${cell}"`).join(", ")}`,
    )
    .join("\n");

  const { text: responseText } = await generateText({
    model: groq("openai/gpt-oss-20b"),
    prompt: `You are a CSV column mapper for a personal finance app. Given column headers and sample data, identify which columns map to:
- dateCol: the column containing transaction dates
- descCol: the column containing transaction descriptions/narrations/references
- amountCol: the column containing the monetary amount (single signed column)
- typeCol: the column indicating income/expense/debit/credit (if present)
- moneyInCol: column for incoming/credit amounts (e.g. "Money In", "Credit") — only if amounts are split across two columns
- moneyOutCol: column for outgoing/debit amounts (e.g. "Money Out", "Debit") — only if amounts are split across two columns

IMPORTANT: Some bank CSVs (e.g. Monzo) use separate "Money In" and "Money Out" columns instead of a single amount column. If you detect this pattern, set moneyInCol and moneyOutCol and leave amountCol as null.

Headers:
${headerList}

Sample data:
${sampleList}

Return ONLY a JSON object with these fields:
- dateCol: column index (0-based integer) or null if not found
- descCol: column index (0-based integer) or null if not found
- amountCol: column index (0-based integer) or null if not found or if using split columns
- typeCol: column index (0-based integer) or null if no type/direction column exists
- moneyInCol: column index (0-based integer) or null if not using split columns
- moneyOutCol: column index (0-based integer) or null if not using split columns

Look at both header names AND data patterns:
- Dates look like YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY etc.
- Amounts are numbers, possibly with currency symbols (£, $, €)
- Descriptions are typically the longest text fields
- Type columns contain words like "credit", "debit", "income", "expense"
- Split amount columns: one column has values only for incoming, the other only for outgoing

Respond with ONLY the JSON object.`,
    maxOutputTokens: 200,
  });

  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return Response.json({ error: "Could not determine column mapping" }, { status: 422 });
  }

  const parsed = mappingSchema.safeParse(JSON.parse(jsonMatch[0]));
  if (!parsed.success) {
    return Response.json({ error: "Could not determine column mapping" }, { status: 422 });
  }

  // Validate indices are within bounds
  const maxCol = headers.length - 1;
  const mapping = parsed.data;
  const clamp = (v: number | null) => (v !== null && v >= 0 && v <= maxCol ? v : null);

  return Response.json({
    dateCol: clamp(mapping.dateCol),
    descCol: clamp(mapping.descCol),
    amountCol: clamp(mapping.amountCol),
    typeCol: clamp(mapping.typeCol),
    moneyInCol: clamp(mapping.moneyInCol ?? null),
    moneyOutCol: clamp(mapping.moneyOutCol ?? null),
  });
}
