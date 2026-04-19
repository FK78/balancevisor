import { groq } from "@ai-sdk/groq";
import { streamText, convertToModelMessages } from "ai";
import type { UIMessage } from "ai";
import { getCurrentUserId } from "@/lib/auth";
import { guardAiEnabled } from "@/lib/ai-guard";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getPortfolioSnapshot, formatPortfolioContext } from "@/lib/portfolio-data";
import { getOtherAssets } from "@/db/queries/other-assets";
import { formatCurrency } from "@/lib/formatCurrency";
import { rateLimiters } from "@/lib/rate-limiter";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();

  const aiBlocked = await guardAiEnabled();
  if (aiBlocked) return aiBlocked;

  const rateLimitResult = rateLimiters.chat.consume(`chat:${userId}`);
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please slow down and try again later." }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter) } },
    );
  }

  const { messages } = await req.json();

  const [accounts, baseCurrency, portfolioSnapshot, otherAssets] = await Promise.all([
    getAccountsWithDetails(userId),
    getUserBaseCurrency(userId),
    getPortfolioSnapshot(userId),
    getOtherAssets(userId),
  ]);

  const investmentValue = portfolioSnapshot.totalValue;
  const portfolioContext = formatPortfolioContext(portfolioSnapshot);

  const liabilityTypes = new Set(["creditCard"]);
  const totalAssets = accounts
    .filter((a) => !liabilityTypes.has(a.type ?? ""))
    .reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts
    .filter((a) => liabilityTypes.has(a.type ?? ""))
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const otherAssetsValue = otherAssets.reduce((sum, a) => sum + a.value, 0);
  const netWorth = totalAssets - totalLiabilities + investmentValue + otherAssetsValue;

  const financialContext = `
## User's Net Worth Snapshot
Currency: ${baseCurrency}

### Net Worth
- Net worth: ${formatCurrency(netWorth, baseCurrency)}
- Total assets: ${formatCurrency(totalAssets, baseCurrency)}
- Total liabilities: ${formatCurrency(totalLiabilities, baseCurrency)}
- Investment value: ${formatCurrency(investmentValue, baseCurrency)}
- Other assets (gold, property, etc.): ${formatCurrency(otherAssetsValue, baseCurrency)}

${portfolioContext}

### Accounts (${accounts.length})
${accounts.map((a) => `- ${a.accountName} (${a.type}): ${formatCurrency(a.balance, baseCurrency)}`).join("\n")}

### Other Assets (${otherAssets.length})
${otherAssets.map((a) => `- ${a.name} (${a.asset_type}): ${formatCurrency(a.value, baseCurrency)}`).join("\n")}
`.trim();

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are BalanceVisor AI, a helpful net-worth and portfolio assistant embedded in the user's dashboard. You have access to the user's real financial data shown below.

Your role:
- Answer questions about the user's net worth, accounts, investments, and other assets
- Provide insight on asset allocation, liability exposure, and portfolio diversification
- Keep responses concise and well-structured with markdown formatting
- Use the user's currency (${baseCurrency}) when mentioning amounts
- If asked about something not in the data (like transactions or spending), explain that this app tracks net worth, not spending

${financialContext}`,
    messages: await convertToModelMessages(messages as UIMessage[]),
    maxOutputTokens: 1024,
  });

  return result.toUIMessageStreamResponse();
}
