import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { rateLimiters } from "@/lib/rate-limiter";

const mappingSchema = z.object({
  dateCol: z.number().int().min(0).nullable(),
  descCol: z.number().int().min(0).nullable(),
  amountCol: z.number().int().min(0).nullable(),
  typeCol: z.number().int().min(0).nullable(),
});

export async function POST(req: Request) {
  const userId = await getCurrentUserId();

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
- amountCol: the column containing the monetary amount
- typeCol: the column indicating income/expense/debit/credit (if present)

Headers:
${headerList}

Sample data:
${sampleList}

Return ONLY a JSON object with these fields:
- dateCol: column index (0-based integer) or null if not found
- descCol: column index (0-based integer) or null if not found
- amountCol: column index (0-based integer) or null if not found
- typeCol: column index (0-based integer) or null if no type/direction column exists

Look at both header names AND data patterns:
- Dates look like YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY etc.
- Amounts are numbers, possibly with currency symbols (£, $, €)
- Descriptions are typically the longest text fields
- Type columns contain words like "credit", "debit", "income", "expense"

Respond with ONLY the JSON object.`,
    maxOutputTokens: 150,
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
  });
}
