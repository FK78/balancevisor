# Investments, Categories, and Other Assets Portfolio Cockpit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recompose investments and categories into cockpit-first decision surfaces, while reframing other assets as portfolio support and adding scoped loading, error, and responsive QA coverage.

**Architecture:** Keep the existing server queries, broker integrations, widget customization, and calculations intact, but extract pure presentation helpers and focused view components from the current large route files. Investments and categories each get a tested cockpit-model builder plus dedicated intro/roster sections, while other assets is refreshed in place and linked back into the portfolio story without becoming a stand-alone product area.

**Tech Stack:** Next.js App Router, React server/client components, TypeScript, Tailwind CSS, Vitest + Testing Library, Playwright, existing cockpit primitives in `src/components/ui/cockpit.tsx`.

---

## File Structure

- Create: `src/components/investments/investments-cockpit.ts`
  Purpose: Pure helper for investments hero copy, primary action choice, priority cards, and holdings grouping/interpretation.
- Create: `src/components/investments/InvestmentsCockpitIntro.tsx`
  Purpose: Investments-specific `SecondaryPageIntro` composition with portfolio tools and other-assets support panel summary.
- Create: `src/components/investments/HoldingsRoster.tsx`
  Purpose: Hybrid holdings presentation with mobile decision cards and desktop comparison table inside account/group sections.
- Create: `src/components/investments/__tests__/investmentsCockpit.test.ts`
  Purpose: Lock the portfolio story logic before rewriting the route.
- Create: `src/components/investments/__tests__/HoldingsRoster.test.tsx`
  Purpose: Lock the hybrid roster presentation and interpretation tags.
- Create: `src/components/categories/categories-cockpit.ts`
  Purpose: Pure helper for categories hero copy, primary action choice, and structure/rule priority signals.
- Create: `src/components/categories/CategoriesCockpitIntro.tsx`
  Purpose: Categories-specific cockpit intro and action shelf.
- Create: `src/components/categories/CategoryStructureGrid.tsx`
  Purpose: Replace admin-style category tiles with structure-first cards.
- Create: `src/components/categories/__tests__/categoriesCockpit.test.ts`
  Purpose: Lock the categories cockpit story logic before route changes.
- Create: `src/components/categories/__tests__/CategoryStructureGrid.test.tsx`
  Purpose: Lock the new category card structure and empty state.
- Create: `src/components/__tests__/OtherAssetsSection.test.tsx`
  Purpose: Lock the portfolio-support framing and empty-state copy for other assets.
- Create: `src/app/dashboard/categories/error.tsx`
  Purpose: Add the calm, recoverable route error state that categories is currently missing.
- Modify: `src/app/dashboard/investments/page.tsx`
  Purpose: Keep the same queries, but delegate portfolio story derivation and holdings rendering to the new components.
- Modify: `src/app/dashboard/investments/loading.tsx`
  Purpose: Mirror the new cockpit shape instead of the old generic card grid.
- Modify: `src/app/dashboard/investments/error.tsx`
  Purpose: Rephrase the route error into calm guidance that matches the new portfolio cockpit.
- Modify: `src/app/dashboard/categories/page.tsx`
  Purpose: Keep the same queries, but add the spending-structure intro, priority stack, and structure-first layout order.
- Modify: `src/app/dashboard/categories/loading.tsx`
  Purpose: Mirror the new categories cockpit shape instead of the old tile skeleton.
- Modify: `src/app/dashboard/accounts/page.tsx`
  Purpose: Keep the current other-assets host, but anchor it cleanly for portfolio support links and copy.
- Modify: `src/components/OtherAssetsSection.tsx`
  Purpose: Reframe the section as “assets outside broker feeds” with total value, upkeep cues, and calmer empty state.
- Modify: `src/lib/widget-registry.ts`
  Purpose: Update labels only where needed to match the new cockpit language while preserving existing widget ids and saved-layout compatibility.
- Modify: `e2e/cockpit-responsive.spec.ts`
  Purpose: Extend responsive QA to cover the new investments and categories cockpit surfaces.

Preserve existing widget ids on `investments` and `categories`. Update labels or visible copy if needed, but do not introduce layout-migration churn in this slice.

## Task 1: Extract and Test the Investments Cockpit Model

**Files:**
- Create: `src/components/investments/investments-cockpit.ts`
- Test: `src/components/investments/__tests__/investmentsCockpit.test.ts`

- [ ] **Step 1: Write the failing portfolio-story tests**

```ts
import { describe, expect, it } from "vitest";
import { buildInvestmentsCockpitModel } from "@/components/investments/investments-cockpit";

const sampleHoldings = [
  {
    id: "manual-apple",
    source: "manual" as const,
    ticker: "AAPL",
    name: "Apple",
    quantity: 10,
    averagePrice: 120,
    currentPrice: 180,
    currency: "GBP",
    value: 1800,
    gainLoss: 600,
    gainLossPercent: 50,
    investmentType: "stock" as const,
    accountId: "acct-1",
    accountName: "ISA",
    groupId: null,
    groupName: null,
    groupColor: null,
    pricePending: false,
  },
  {
    id: "manual-tsla",
    source: "manual" as const,
    ticker: "TSLA",
    name: "Tesla",
    quantity: 2,
    averagePrice: 200,
    currentPrice: 160,
    currency: "GBP",
    value: 320,
    gainLoss: -80,
    gainLossPercent: -20,
    investmentType: "stock" as const,
    accountId: "acct-1",
    accountName: "ISA",
    groupId: null,
    groupName: null,
    groupColor: null,
    pricePending: true,
  },
];

describe("buildInvestmentsCockpitModel", () => {
  it("prioritises broker recovery over every other primary action", () => {
    const model = buildInvestmentsCockpitModel({
      holdings: sampleHoldings,
      brokerErrors: [{ broker: "Trading 212", message: "Token expired" }],
      brokerCash: 0,
      totalRealizedGain: 200,
      baseCurrency: "GBP",
      allGroups: [],
    });

    expect(model.primaryAction.key).toBe("reconnect-broker");
    expect(model.heroTitle).toMatch(/broker connection needs attention/i);
    expect(model.priorityCards[0].id).toBe("broker-health");
  });

  it("creates an explicit ungrouped section and holding interpretation copy", () => {
    const model = buildInvestmentsCockpitModel({
      holdings: sampleHoldings,
      brokerErrors: [],
      brokerCash: 0,
      totalRealizedGain: 0,
      baseCurrency: "GBP",
      allGroups: [],
    });

    expect(model.accountSections[0]?.groups[0]?.title).toBe("Individual holdings");
    expect(model.accountSections[0]?.groups[0]?.holdings[0]?.interpretation).toMatch(
      /largest position/i,
    );
    expect(model.accountSections[0]?.groups[0]?.holdings[1]?.interpretation).toMatch(
      /price needs refreshing/i,
    );
  });
});
```

- [ ] **Step 2: Run the new tests to verify the helper does not exist yet**

Run:

```bash
npx vitest run src/components/investments/__tests__/investmentsCockpit.test.ts
```

Expected: FAIL with a module-resolution error for `@/components/investments/investments-cockpit` or missing exported symbol errors.

- [ ] **Step 3: Implement the pure investments cockpit helper**

```ts
import { formatCurrency } from "@/lib/formatCurrency";

type PrimaryActionKey =
  | "review-concentration"
  | "reconnect-broker"
  | "refresh-prices"
  | "add-holding";

function buildInvestmentPriorityCards(params: {
  holdings: { value: number }[];
  topHoldingShare: number;
  brokerErrors: { broker: string; message: string }[];
  stalePriceCount: number;
  totalRealizedGain: number;
  baseCurrency: string;
}) {
  return [
    {
      id: "concentration",
      title:
        params.topHoldingShare >= 0.35
          ? `${Math.round(params.topHoldingShare * 100)}% of value sits in one position`
          : "No single holding is dominating the portfolio",
      description: "Use this card to decide whether concentration deserves action before deeper analysis.",
    },
    {
      id: "broker-health",
      title:
        params.brokerErrors.length > 0
          ? `${params.brokerErrors.length} broker connection issue${params.brokerErrors.length === 1 ? "" : "s"}`
          : `${params.stalePriceCount} holding${params.stalePriceCount === 1 ? "" : "s"} need fresher prices`,
      description: "Data quality should be visible before charts or AI analysis begin.",
    },
    {
      id: "realised-gains",
      title: `${formatCurrency(params.totalRealizedGain, params.baseCurrency)} realised so far`,
      description: "Keep realised outcomes near the top so closed gains do not get buried below the holdings table.",
    },
  ];
}

function groupHoldingsByAccount(
  holdings: {
    id: string;
    accountId?: string | null;
    accountName?: string | null;
    groupId?: string | null;
    ticker: string | null;
    name: string;
    investmentType: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    value: number;
    gainLoss: number;
    gainLossPercent: number;
    source: string;
    pricePending?: boolean;
  }[],
  allGroups: { id: string; name: string; color: string; account_id: string | null }[],
  totalValue: number,
) {
  const accountIds = [...new Set(holdings.map((holding) => holding.accountId ?? "unlinked"))];

  return accountIds.map((accountId) => {
    const accountHoldings = holdings.filter((holding) => (holding.accountId ?? "unlinked") === accountId);
    const matchedGroups = allGroups.filter((group) => group.account_id === (accountId === "unlinked" ? null : accountId));
    const ungrouped = accountHoldings.filter((holding) => !holding.groupId || !matchedGroups.some((group) => group.id === holding.groupId));

    return {
      id: accountId,
      title: accountHoldings[0]?.accountName ?? "Unlinked holdings",
      description: `${accountHoldings.length} holding${accountHoldings.length === 1 ? "" : "s"}`,
      groups: [
        ...matchedGroups.map((group) => ({
          id: group.id,
          title: group.name,
          description: `${accountHoldings.filter((holding) => holding.groupId === group.id).length} grouped holdings`,
          holdings: accountHoldings
            .filter((holding) => holding.groupId === group.id)
            .map((holding) => ({
              id: holding.id,
              ticker: holding.ticker,
              name: holding.name,
              sourceLabel: holding.source === "manual" ? "Manual" : holding.source,
              investmentTypeLabel: holding.investmentType,
              quantityLabel: `${holding.quantity}`,
              averagePriceLabel: formatCurrency(holding.averagePrice, "GBP"),
              currentPriceLabel: formatCurrency(holding.currentPrice, "GBP"),
              valueLabel: formatCurrency(holding.value, "GBP"),
              gainLossLabel: `${holding.gainLoss >= 0 ? "+" : "−"}${formatCurrency(Math.abs(holding.gainLoss), "GBP")}`,
              gainLossPercentLabel: `${holding.gainLossPercent >= 0 ? "+" : ""}${holding.gainLossPercent.toFixed(2)}%`,
              interpretation:
                holding.pricePending
                  ? "Manual price needs refreshing"
                  : totalValue > 0 && holding.value / totalValue >= 0.25
                    ? "Largest position in portfolio"
                    : "Smaller supporting exposure in the portfolio",
              pricePending: holding.pricePending ?? false,
              actionSlot: null,
            })),
        })),
        {
          id: "ungrouped",
          title: "Individual holdings",
          description: "No group applied",
          holdings: ungrouped.map((holding) => ({
            id: holding.id,
            ticker: holding.ticker,
            name: holding.name,
            sourceLabel: holding.source === "manual" ? "Manual" : holding.source,
            investmentTypeLabel: holding.investmentType,
            quantityLabel: `${holding.quantity}`,
            averagePriceLabel: formatCurrency(holding.averagePrice, "GBP"),
            currentPriceLabel: formatCurrency(holding.currentPrice, "GBP"),
            valueLabel: formatCurrency(holding.value, "GBP"),
            gainLossLabel: `${holding.gainLoss >= 0 ? "+" : "−"}${formatCurrency(Math.abs(holding.gainLoss), "GBP")}`,
            gainLossPercentLabel: `${holding.gainLossPercent >= 0 ? "+" : ""}${holding.gainLossPercent.toFixed(2)}%`,
            interpretation:
              holding.pricePending
                ? "Manual price needs refreshing"
                : totalValue > 0 && holding.value / totalValue >= 0.25
                  ? "Largest position in portfolio"
                  : "Smaller supporting exposure in the portfolio",
            pricePending: holding.pricePending ?? false,
            actionSlot: null,
          })),
        },
      ],
    };
  });
}

export function buildInvestmentsCockpitModel(input: {
  holdings: {
    id: string;
    accountId?: string | null;
    accountName?: string | null;
    groupId?: string | null;
    ticker: string | null;
    name: string;
    investmentType: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    value: number;
    gainLoss: number;
    gainLossPercent: number;
    source: string;
    pricePending?: boolean;
  }[];
  brokerErrors: { broker: string; message: string }[];
  brokerCash: number;
  totalRealizedGain: number;
  baseCurrency: string;
  allGroups: { id: string; name: string; color: string; account_id: string | null }[];
}) {
  const totalValue = input.holdings.reduce((sum, holding) => sum + holding.value, 0) + input.brokerCash;
  const sortedHoldings = [...input.holdings].sort((left, right) => right.value - left.value);
  const topHolding = sortedHoldings[0] ?? null;
  const topHoldingShare = topHolding && totalValue > 0 ? topHolding.value / totalValue : 0;
  const stalePriceCount = sortedHoldings.filter((holding) => holding.pricePending).length;

  const primaryAction: { key: PrimaryActionKey; label: string } =
    input.brokerErrors.length > 0
      ? { key: "reconnect-broker", label: "Reconnect broker" }
      : stalePriceCount > 0
        ? { key: "refresh-prices", label: "Refresh prices" }
        : topHoldingShare >= 0.35
          ? { key: "review-concentration", label: "Review concentration" }
          : { key: "add-holding", label: "Add holding" };

  const heroTitle =
    input.brokerErrors.length > 0
      ? "Returns are positive, but one broker connection needs attention"
      : stalePriceCount > 0
        ? "Most of the portfolio is healthy, but manual prices are stale"
        : topHoldingShare >= 0.35
          ? "Portfolio is growing, but too much sits in one position"
          : "Portfolio looks balanced enough to focus on the next long-term move";

  return {
    heroTitle,
    heroDescription: `Current value ${formatCurrency(totalValue, input.baseCurrency)} across ${sortedHoldings.length} active holding${sortedHoldings.length === 1 ? "" : "s"}.`,
    primaryAction,
    priorityCards: buildInvestmentPriorityCards({
      holdings: sortedHoldings,
      topHoldingShare,
      brokerErrors: input.brokerErrors,
      stalePriceCount,
      totalRealizedGain: input.totalRealizedGain,
      baseCurrency: input.baseCurrency,
    }),
    accountSections: groupHoldingsByAccount(sortedHoldings, input.allGroups, totalValue),
  };
}
```

- [ ] **Step 4: Run the helper tests until they pass**

Run:

```bash
npx vitest run src/components/investments/__tests__/investmentsCockpit.test.ts
```

Expected: PASS with both portfolio-story tests green.

- [ ] **Step 5: Commit the isolated helper**

```bash
git add src/components/investments/investments-cockpit.ts src/components/investments/__tests__/investmentsCockpit.test.ts
git commit -m "test: add investments cockpit model coverage"
```

## Task 2: Build the Investments Cockpit UI and Route States

**Files:**
- Create: `src/components/investments/InvestmentsCockpitIntro.tsx`
- Create: `src/components/investments/HoldingsRoster.tsx`
- Test: `src/components/investments/__tests__/HoldingsRoster.test.tsx`
- Modify: `src/app/dashboard/investments/page.tsx`
- Modify: `src/app/dashboard/investments/loading.tsx`
- Modify: `src/app/dashboard/investments/error.tsx`
- Modify: `src/lib/widget-registry.ts`

- [ ] **Step 1: Write the failing holdings roster test**

```tsx
// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HoldingsRoster } from "@/components/investments/HoldingsRoster";

describe("HoldingsRoster", () => {
  it("renders decision-card context and the desktop comparison headings", () => {
    render(
      <HoldingsRoster
        accountSections={[
          {
            id: "acct-1",
            title: "ISA",
            description: "2 holdings",
            groups: [
              {
                id: "ungrouped",
                title: "Individual holdings",
                description: "No group applied",
                holdings: [
                  {
                    id: "manual-apple",
                    ticker: "AAPL",
                    name: "Apple",
                    sourceLabel: "Manual",
                    investmentTypeLabel: "Stock",
                    quantityLabel: "10",
                    averagePriceLabel: "£120.00",
                    currentPriceLabel: "£180.00",
                    valueLabel: "£1,800.00",
                    gainLossLabel: "+£600.00",
                    gainLossPercentLabel: "+50.00%",
                    interpretation: "Largest position in portfolio",
                    pricePending: false,
                    actionSlot: null,
                  },
                ],
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText(/largest position in portfolio/i)).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /value/i })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /gain \\/ loss/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the new holdings roster test to verify the component is missing**

Run:

```bash
npx vitest run src/components/investments/__tests__/HoldingsRoster.test.tsx
```

Expected: FAIL with a module-resolution error for `@/components/investments/HoldingsRoster`.

- [ ] **Step 3: Implement the intro, hybrid roster, and route composition**

```tsx
// src/components/investments/InvestmentsCockpitIntro.tsx
import { SecondaryPageIntro } from "@/components/SecondaryPageIntro";

export function InvestmentsCockpitIntro({
  model,
  heroAction,
  actionShelfContent,
  otherAssetsSummary,
}: {
  model: {
    heroTitle: string;
    heroDescription: string;
    priorityCards: { id: string; title: string; description: string }[];
  };
  heroAction: React.ReactNode;
  actionShelfContent: React.ReactNode;
  otherAssetsSummary:
    | {
        title: string;
        description: string;
        content: React.ReactNode;
      }
    | null;
}) {
  return (
    <SecondaryPageIntro
      heroEyebrow="Portfolio health"
      heroTitle={model.heroTitle}
      heroDescription={model.heroDescription}
      heroAction={heroAction}
      actionShelfEyebrow="Portfolio tools"
      actionShelfTitle="Keep the next portfolio move close at hand"
      actionShelfDescription="Connect, add, regroup, or refresh without pushing the risk story off-screen."
      actionShelfContent={actionShelfContent}
      supportPanel={
        otherAssetsSummary
          ? {
              eyebrow: "Assets outside broker feeds",
              title: otherAssetsSummary.title,
              description: otherAssetsSummary.description,
              content: otherAssetsSummary.content,
            }
          : null
      }
      priorities={{
        eyebrow: "Priority stack",
        title: "See what matters before the tables and charts",
        description: "Concentration, data quality, and realised gains should be clear before deeper portfolio analysis.",
        items: model.priorityCards,
      }}
    />
  );
}

// src/components/investments/HoldingsRoster.tsx
export function HoldingsRoster({
  accountSections,
}: {
  accountSections: {
    id: string;
    title: string;
    description: string;
    groups: {
      id: string;
      title: string;
      description: string;
      holdings: {
        id: string;
        ticker: string | null;
        name: string;
        investmentTypeLabel: string;
        quantityLabel: string;
        averagePriceLabel: string;
        currentPriceLabel: string;
        valueLabel: string;
        gainLossLabel: string;
        gainLossPercentLabel: string;
        interpretation: string;
        actionSlot: React.ReactNode;
      }[];
    }[];
  }[];
}) {
  return (
    <div className="space-y-6">
      {accountSections.map((section) => (
        <Card key={section.id}>
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
            <CardDescription>{section.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {section.groups.map((group) => (
              <section key={group.id} className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold tracking-tight">{group.title}</h3>
                  <p className="text-xs text-muted-foreground">{group.description}</p>
                </div>

                <div className="space-y-3 md:hidden">
                  {group.holdings.map((holding) => (
                    <article key={holding.id} className="priority-card">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{holding.ticker ?? holding.name}</p>
                          <p className="text-xs text-muted-foreground">{holding.name}</p>
                        </div>
                        <p className="text-sm font-semibold tabular-nums">{holding.valueLabel}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{holding.interpretation}</p>
                    </article>
                  ))}
                </div>

                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Holding</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Shares</TableHead>
                        <TableHead className="text-right">Avg price</TableHead>
                        <TableHead className="text-right">Current</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                        <TableHead className="text-right">Gain / Loss</TableHead>
                        <TableHead className="w-[88px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.holdings.map((holding) => (
                        <TableRow key={holding.id}>
                          <TableCell>{holding.ticker ?? holding.name}</TableCell>
                          <TableCell>{holding.investmentTypeLabel}</TableCell>
                          <TableCell className="text-right">{holding.quantityLabel}</TableCell>
                          <TableCell className="text-right">{holding.averagePriceLabel}</TableCell>
                          <TableCell className="text-right">{holding.currentPriceLabel}</TableCell>
                          <TableCell className="text-right font-medium">{holding.valueLabel}</TableCell>
                          <TableCell className="text-right">
                            <div>{holding.gainLossLabel}</div>
                            <div className="text-xs text-muted-foreground">{holding.gainLossPercentLabel}</div>
                          </TableCell>
                          <TableCell>{holding.actionSlot}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// src/app/dashboard/investments/page.tsx
const otherAssets = await getOtherAssets(userId);
const cockpitModel = buildInvestmentsCockpitModel({
  holdings,
  brokerErrors,
  brokerCash,
  totalRealizedGain,
  baseCurrency,
  allGroups,
});

const headerActionShelf = (
  <div className="flex flex-wrap gap-2">
    <ConnectBrokerDialog connectedBrokers={connectedBrokers} investmentAccounts={investmentAccounts} />
    <InvestmentGroupDialog investmentAccounts={investmentAccounts} />
    <AddHoldingDialog investmentAccounts={investmentAccounts} groups={groupOptions} />
    <AddPrivateInvestmentDialog investmentAccounts={investmentAccounts} groups={groupOptions} />
    {manualHoldings.length > 0 ? <RefreshPricesButton /> : null}
  </div>
);

const introEl = (
  <InvestmentsCockpitIntro
    model={cockpitModel}
    heroAction={
      cockpitModel.primaryAction.key === "reconnect-broker" ? (
        <ConnectBrokerDialog connectedBrokers={connectedBrokers} investmentAccounts={investmentAccounts} />
      ) : cockpitModel.primaryAction.key === "refresh-prices" ? (
        <RefreshPricesButton />
      ) : cockpitModel.primaryAction.key === "review-concentration" ? (
        <a href="#holdings-roster" className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Review concentration
        </a>
      ) : (
        <AddHoldingDialog investmentAccounts={investmentAccounts} groups={groupOptions} />
      )
    }
    actionShelfContent={headerActionShelf}
    otherAssetsSummary={{
      title: `${otherAssets.length} off-platform asset${otherAssets.length === 1 ? "" : "s"} worth ${formatCurrency(otherAssets.reduce((sum, asset) => sum + asset.value, 0), baseCurrency)}`,
      description: "Keep property, gold, pensions, and other manual assets close to the broker story without turning them into a separate product page.",
      content: (
        <a href="/dashboard/accounts#other-assets" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Review assets outside broker feeds
        </a>
      ),
    }}
  />
);

return (
  <PageWidgetWrapper pageId="investments" serverLayout={serverLayout} header={headerEl} intro={introEl}>
    <DashboardWidget id="summary-cards">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total value</CardDescription>
            <CardTitle>{formatCurrency(totalInvestmentValue, baseCurrency)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">{holdings.length} active holdings</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Open gain / loss</CardDescription>
            <CardTitle>{totalGainLoss >= 0 ? "+" : "−"}{formatCurrency(Math.abs(totalGainLoss), baseCurrency)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">{totalGainLossPercent.toFixed(2)}% overall return</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cost basis</CardDescription>
            <CardTitle>{formatCurrency(totalCost, baseCurrency)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Capital currently at work</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Realised gains</CardDescription>
            <CardTitle>{totalRealizedGain >= 0 ? "+" : "−"}{formatCurrency(Math.abs(totalRealizedGain), baseCurrency)}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">{sales.length} completed sale{sales.length === 1 ? "" : "s"}</CardContent>
        </Card>
      </div>
    </DashboardWidget>
    <DashboardWidget id="charts">
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Portfolio insights"
          title="Use the charts to confirm the risk story, not replace it"
          description="Allocation and performance visuals stay valuable once the concentration and data-quality story is already clear."
        />
        <InvestmentCharts holdings={sortedHoldings} currency={baseCurrency} />
      </section>
    </DashboardWidget>
    <DashboardWidget id="ai-analysis">
      <section className="space-y-3">
        <SectionHeader
          eyebrow="AI perspective"
          title="Keep the generated analysis close, but secondary"
          description="The page should make the human-readable portfolio story obvious before AI commentary takes over."
        />
        <PortfolioAIAnalysis />
      </section>
    </DashboardWidget>
    <DashboardWidget id="holdings-table">
      <div id="holdings-roster">
        <HoldingsRoster accountSections={cockpitModel.accountSections} />
      </div>
    </DashboardWidget>
  </PageWidgetWrapper>
);
```

- [ ] **Step 4: Verify the investments UI tests and route-specific safety net**

Run:

```bash
npx vitest run \
  src/components/investments/__tests__/investmentsCockpit.test.ts \
  src/components/investments/__tests__/HoldingsRoster.test.tsx
```

Expected: PASS with the investments helper and hybrid roster tests both green.

- [ ] **Step 5: Commit the investments cockpit route rewrite**

```bash
git add \
  src/components/investments/investments-cockpit.ts \
  src/components/investments/InvestmentsCockpitIntro.tsx \
  src/components/investments/HoldingsRoster.tsx \
  src/components/investments/__tests__/investmentsCockpit.test.ts \
  src/components/investments/__tests__/HoldingsRoster.test.tsx \
  src/app/dashboard/investments/page.tsx \
  src/app/dashboard/investments/loading.tsx \
  src/app/dashboard/investments/error.tsx \
  src/lib/widget-registry.ts
git commit -m "feat: redesign investments portfolio cockpit"
```

## Task 3: Build the Categories Cockpit and Structure-First Layout

**Files:**
- Create: `src/components/categories/categories-cockpit.ts`
- Create: `src/components/categories/CategoriesCockpitIntro.tsx`
- Create: `src/components/categories/CategoryStructureGrid.tsx`
- Create: `src/components/categories/__tests__/categoriesCockpit.test.ts`
- Create: `src/components/categories/__tests__/CategoryStructureGrid.test.tsx`
- Modify: `src/app/dashboard/categories/page.tsx`
- Modify: `src/app/dashboard/categories/loading.tsx`
- Create: `src/app/dashboard/categories/error.tsx`
- Modify: `src/lib/widget-registry.ts`

- [ ] **Step 1: Write the failing categories cockpit tests**

```ts
import { describe, expect, it } from "vitest";
import { buildCategoriesCockpitModel } from "@/components/categories/categories-cockpit";

describe("buildCategoriesCockpitModel", () => {
  it("prefers add rule when top spend categories are not represented by rules", () => {
    const model = buildCategoriesCockpitModel({
      categories: [
        { id: "food", name: "Food", color: "#22c55e", icon: null, user_id: "user-1" },
        { id: "travel", name: "Travel", color: "#3b82f6", icon: null, user_id: "user-1" },
      ],
      topSpendByCategory: [
        { category: "Food", color: "#22c55e", total: 620 },
        { category: "Travel", color: "#3b82f6", total: 410 },
      ],
      monthlySpendRows: [],
      rules: [],
      baseCurrency: "GBP",
    });

    expect(model.primaryAction.key).toBe("add-rule");
    expect(model.heroTitle).toMatch(/manual cleanup/i);
  });
});
```

```tsx
// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryStructureGrid } from "@/components/categories/CategoryStructureGrid";

describe("CategoryStructureGrid", () => {
  it("renders structure cards with spend share and movement context", () => {
    render(
      <CategoryStructureGrid
        categories={[
          {
            id: "food",
            name: "Food",
            color: "#22c55e",
            spendLabel: "£620.00",
            shareLabel: "41% of tracked spend",
            trendLabel: "Rising fastest this month",
            actionSlot: <button type="button">Edit Food</button>,
          },
        ]}
        emptyAction={null}
      />,
    );

    expect(screen.getByText(/41% of tracked spend/i)).toBeInTheDocument();
    expect(screen.getByText(/rising fastest this month/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit food/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the categories tests to prove the new helpers are missing**

Run:

```bash
npx vitest run \
  src/components/categories/__tests__/categoriesCockpit.test.ts \
  src/components/categories/__tests__/CategoryStructureGrid.test.tsx
```

Expected: FAIL with module-resolution errors for the new categories cockpit files.

- [ ] **Step 3: Implement the categories cockpit model and page layout**

```ts
// src/components/categories/categories-cockpit.ts
function getStrongestCategoryMove(
  rows: { category: string; month: string; total: number; color: string }[],
) {
  const months = [...new Set(rows.map((row) => row.month))].sort();
  const latestMonth = months.at(-1);
  const previousMonth = months.at(-2);

  if (!latestMonth || !previousMonth) {
    return {
      id: "movement",
      title: "Build a longer trend to judge movement confidently",
      description: "Once at least two months exist, this card should call out the sharpest category shift.",
    };
  }

  const latestTotals = rows.filter((row) => row.month === latestMonth);
  const previousTotals = new Map(
    rows.filter((row) => row.month === previousMonth).map((row) => [row.category, row.total]),
  );

  const strongest = latestTotals
    .map((row) => ({
      category: row.category,
      delta: row.total - (previousTotals.get(row.category) ?? 0),
    }))
    .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))[0];

  return strongest
    ? {
        id: "movement",
        title: `${strongest.category} moved the most month to month`,
        description: `${strongest.delta >= 0 ? "Spending increased" : "Spending cooled"} enough to deserve a quick review.`,
      }
    : {
        id: "movement",
        title: "Movement is steady across tracked categories",
        description: "No single category is swinging enough to become the next best action yet.",
      };
}

function buildRuleCoverageCard(uncoveredLeaders: { category: string }[]) {
  return uncoveredLeaders.length > 0
    ? {
        id: "rule-coverage",
        title: `${uncoveredLeaders.length} top category${uncoveredLeaders.length === 1 ? "" : "ies"} lack rule support`,
        description: `Start with ${uncoveredLeaders.map((row) => row.category).join(", ")} to reduce recurring manual cleanup.`,
      }
    : {
        id: "rule-coverage",
        title: "Rules already cover the biggest spending destinations",
        description: "Automation looks healthy enough to keep rules as a secondary maintenance task.",
      };
}

export function buildCategoriesCockpitModel(input: {
  categories: { id: string; name: string; color: string; icon: string | null; user_id: string }[];
  topSpendByCategory: { category: string; color: string; total: number }[];
  monthlySpendRows: { category: string; month: string; total: number; color: string }[];
  rules: { id: string; categoryName: string | null; priority: number; pattern: string }[];
  baseCurrency: string;
}) {
  const totalTrackedSpend = input.topSpendByCategory.reduce((sum, row) => sum + row.total, 0);
  const topCategories = [...input.topSpendByCategory].sort((left, right) => right.total - left.total);
  const topFourShare = totalTrackedSpend > 0
    ? topCategories.slice(0, 4).reduce((sum, row) => sum + row.total, 0) / totalTrackedSpend
    : 0;

  const ruleTargets = new Set(input.rules.map((rule) => rule.categoryName).filter(Boolean));
  const uncoveredLeaders = topCategories.filter((row) => !ruleTargets.has(row.category)).slice(0, 3);
  const strongestMover = getStrongestCategoryMove(input.monthlySpendRows);

  return {
    heroTitle:
      uncoveredLeaders.length > 0
        ? "Most spending sits in a few categories, and missing rules are creating manual cleanup"
        : "Your category structure is stable, with one or two areas worth tuning next",
    heroDescription: `${topCategories.length} tracked categories are shaping this month’s spend picture.`,
    primaryAction:
      uncoveredLeaders.length > 0
        ? { key: "add-rule", label: "Add rule" }
        : { key: "add-category", label: "Add category" },
    priorityCards: [
      {
        id: "concentration",
        title: `${Math.round(topFourShare * 100)}% of tracked spend sits in the top categories`,
        description: "Lead with where the month is actually being shaped, not with taxonomy maintenance.",
      },
      strongestMover,
      buildRuleCoverageCard(uncoveredLeaders),
    ],
  };
}
```

```tsx
// src/components/categories/CategoriesCockpitIntro.tsx
export function CategoriesCockpitIntro({
  model,
  primaryAction,
  actionShelfContent,
}: {
  model: {
    heroTitle: string;
    heroDescription: string;
    priorityCards: { id: string; title: string; description: string }[];
  };
  primaryAction: React.ReactNode;
  actionShelfContent: React.ReactNode;
}) {
  return (
    <SecondaryPageIntro
      heroEyebrow="Spending structure"
      heroTitle={model.heroTitle}
      heroDescription={model.heroDescription}
      heroAction={primaryAction}
      actionShelfEyebrow="Category tools"
      actionShelfTitle="Understand structure first, then tune the taxonomy"
      actionShelfDescription="Keep category edits and rule creation nearby without letting them become the whole page."
      actionShelfContent={actionShelfContent}
      priorities={{
        eyebrow: "Priority stack",
        title: "See the categories shaping the month",
        description: "Spend concentration, movement, and automation coverage should all be visible before the full maintenance lists.",
        items: model.priorityCards,
      }}
    />
  );
}
```

```tsx
// src/app/dashboard/categories/page.tsx
const cockpitModel = buildCategoriesCockpitModel({
  categories,
  topSpendByCategory,
  monthlySpendRows,
  rules,
  baseCurrency,
});

const primaryCategoryAction =
  cockpitModel.primaryAction.key === "add-rule" && categories.length > 0
    ? <CategorisationRuleFormDialog categories={categories} />
    : <CategoryFormDialog />;

const headerActions = (
  <div className="flex flex-wrap gap-2">
    <CategoryFormDialog />
    {categories.length > 0 ? <CategorisationRuleFormDialog categories={categories} /> : null}
  </div>
);

const categoryCards = categories.map((category) => {
  const spendRow = topSpendByCategory.find((row) => row.category === category.name);
  const totalTrackedSpend = topSpendByCategory.reduce((sum, row) => sum + row.total, 0);
  const share = spendRow && totalTrackedSpend > 0 ? Math.round((spendRow.total / totalTrackedSpend) * 100) : 0;

  return {
    id: category.id,
    name: category.name,
    color: category.color,
    spendLabel: spendRow ? formatCurrency(spendRow.total, baseCurrency) : formatCurrency(0, baseCurrency),
    shareLabel: spendRow ? `${share}% of tracked spend` : "Quiet this month",
    trendLabel: spendRow ? "Part of the current spending structure" : "No major spend registered this month",
    actionSlot: <CategoryFormDialog category={category} />,
  };
});

return (
  <PageWidgetWrapper
    pageId="categories"
    serverLayout={serverLayout}
    header={headerEl}
    intro={
      <CategoriesCockpitIntro
        model={cockpitModel}
        primaryAction={primaryCategoryAction}
        actionShelfContent={headerActions}
      />
    }
  >
    <DashboardWidget id="charts">
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Structure view"
          title="See where spending is concentrated before editing categories"
          description="Charts and trend summaries should explain the month before the maintenance grid begins."
        />
        <CategoryCharts
          topThisMonth={topSpendByCategory}
          monthlyRows={monthlySpendRows}
          currency={baseCurrency}
        />
      </section>
    </DashboardWidget>
    <DashboardWidget id="all-categories">
      <CategoryStructureGrid categories={categoryCards} emptyAction={<CategoryFormDialog />} />
    </DashboardWidget>
    <DashboardWidget id="auto-rules">
      <section className="space-y-4">
        <SectionHeader
          eyebrow="Automation quality"
          title="Tune rules after the spending story is clear"
          description="Keep rules easy to scan by pattern, destination, and which meaningful categories they actually support."
        />
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center gap-3 rounded-xl border border-border/60 p-3">
              <div className="min-w-0 flex-1">
                <code className="rounded-lg bg-muted px-2 py-0.5 text-xs font-medium">{rule.pattern}</code>
                <p className="mt-1 text-xs text-muted-foreground">
                  Routes into {rule.categoryName ?? "an uncategorised destination"} with priority {rule.priority}.
                </p>
              </div>
              <div className="shrink-0">
                <DeleteRuleButton ruleId={rule.id} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </DashboardWidget>
  </PageWidgetWrapper>
);
```

- [ ] **Step 4: Run the categories tests and route-level safety net**

Run:

```bash
npx vitest run \
  src/components/categories/__tests__/categoriesCockpit.test.ts \
  src/components/categories/__tests__/CategoryStructureGrid.test.tsx
```

Expected: PASS with both categories cockpit tests green.

- [ ] **Step 5: Commit the categories cockpit rewrite**

```bash
git add \
  src/components/categories/categories-cockpit.ts \
  src/components/categories/CategoriesCockpitIntro.tsx \
  src/components/categories/CategoryStructureGrid.tsx \
  src/components/categories/__tests__/categoriesCockpit.test.ts \
  src/components/categories/__tests__/CategoryStructureGrid.test.tsx \
  src/app/dashboard/categories/page.tsx \
  src/app/dashboard/categories/loading.tsx \
  src/app/dashboard/categories/error.tsx \
  src/lib/widget-registry.ts
git commit -m "feat: redesign categories structure cockpit"
```

## Task 4: Reframe Other Assets as Portfolio Support

**Files:**
- Modify: `src/components/OtherAssetsSection.tsx`
- Test: `src/components/__tests__/OtherAssetsSection.test.tsx`
- Modify: `src/app/dashboard/accounts/page.tsx`

- [ ] **Step 1: Write the failing other-assets framing test**

```tsx
// @vitest-environment happy-dom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OtherAssetsSection } from "@/components/OtherAssetsSection";

describe("OtherAssetsSection", () => {
  it("frames other assets as wealth outside broker feeds", () => {
    render(
      <OtherAssetsSection
        assets={[
          {
            id: "asset-1",
            name: "Family gold",
            asset_type: "gold",
            value: 2400,
            weight_grams: 48,
            is_zakatable: true,
            notes: "Wedding jewellery",
          },
        ]}
        baseCurrency="GBP"
      />,
    );

    expect(screen.getByRole("heading", { name: /assets outside broker feeds/i })).toBeInTheDocument();
    expect(screen.getByText(/review with market prices/i)).toBeInTheDocument();
    expect(screen.getByText(/zakatable/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the other-assets test to confirm the current copy does not match**

Run:

```bash
npx vitest run src/components/__tests__/OtherAssetsSection.test.tsx
```

Expected: FAIL because the current heading and upkeep copy still say `Other Assets` and do not expose a review cue.

- [ ] **Step 3: Implement the portfolio-support framing**

```tsx
function getAssetReviewLabel(asset: OtherAsset) {
  if (asset.asset_type === "gold" || asset.asset_type === "silver") {
    return "Review with market prices";
  }

  if (asset.asset_type === "property" || asset.asset_type === "business" || asset.asset_type === "pension") {
    return "Review value seasonally";
  }

  return "Keep details current";
}

export function OtherAssetsSection({ assets, baseCurrency }: OtherAssetsSectionProps) {
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <section id="other-assets" className="space-y-4">
      <SoftPanel
        eyebrow="Portfolio support"
        title="Assets outside broker feeds"
        description={`Keep off-platform wealth visible alongside the rest of your money picture. Total tracked value: ${formatCurrency(totalValue, baseCurrency)}.`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {assets.map((asset) => (
            <Card key={asset.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{asset.name}</p>
                    <p className="text-xs text-muted-foreground">{ASSET_TYPE_LABELS[asset.asset_type] ?? asset.asset_type}</p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">{formatCurrency(asset.value, baseCurrency)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {asset.is_zakatable ? <Badge variant="outline">Zakatable</Badge> : null}
                  <Badge variant="secondary">{getAssetReviewLabel(asset)}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </SoftPanel>
    </section>
  );
}
```

- [ ] **Step 4: Run the other-assets test until it passes**

Run:

```bash
npx vitest run src/components/__tests__/OtherAssetsSection.test.tsx
```

Expected: PASS with the new portfolio-support heading and review cue visible.

- [ ] **Step 5: Commit the other-assets refresh**

```bash
git add \
  src/components/OtherAssetsSection.tsx \
  src/components/__tests__/OtherAssetsSection.test.tsx \
  src/app/dashboard/accounts/page.tsx
git commit -m "feat: reframe other assets as portfolio support"
```

## Task 5: Extend Responsive QA and Run Final Verification

**Files:**
- Modify: `e2e/cockpit-responsive.spec.ts`
- Modify: `src/app/dashboard/investments/page.tsx`
- Modify: `src/app/dashboard/categories/page.tsx`

- [ ] **Step 1: Write the failing responsive assertions for investments and categories**

```ts
test("investments keeps portfolio tools and off-platform support visible", async ({ page }) => {
  await expectResponsiveRoute(page, "/dashboard/investments", async (currentPage) => {
    await expect(currentPage.getByText(/portfolio tools/i)).toBeVisible();
    await expect(currentPage.getByText(/assets outside broker feeds/i)).toBeVisible();
  });
});

test("categories keeps spending structure above maintenance lists", async ({ page }) => {
  await expectResponsiveRoute(page, "/dashboard/categories", async (currentPage) => {
    await expect(currentPage.getByText(/spending structure/i)).toBeVisible();
    await expect(currentPage.getByText(/understand structure first/i)).toBeVisible();
  });
});
```

- [ ] **Step 2: Run Playwright to verify the new assertions fail before the route copy is final**

Run:

```bash
npx playwright test e2e/cockpit-responsive.spec.ts --grep "investments|categories"
```

Expected: FAIL until the route copy and headings match the new cockpit assertions.

- [ ] **Step 3: Align the route copy and finish the responsive coverage**

```tsx
// investments intro copy
actionShelfTitle="Portfolio tools"
supportPanel={{
  eyebrow: "Assets outside broker feeds",
  title: otherAssetsSummary.title,
  description: otherAssetsSummary.description,
  content: otherAssetsSummary.content,
}}

// categories intro copy
heroEyebrow="Spending structure"
actionShelfTitle="Understand structure first, then tune the taxonomy"
```

- [ ] **Step 4: Run the full verification suite for this slice**

Run:

```bash
npx vitest run \
  src/components/investments/__tests__/investmentsCockpit.test.ts \
  src/components/investments/__tests__/HoldingsRoster.test.tsx \
  src/components/categories/__tests__/categoriesCockpit.test.ts \
  src/components/categories/__tests__/CategoryStructureGrid.test.tsx \
  src/components/__tests__/OtherAssetsSection.test.tsx

npx playwright test e2e/auth.spec.ts e2e/cockpit-responsive.spec.ts

npx tsc --noEmit

npx eslint --no-warn-ignored \
  src/app/dashboard/investments/page.tsx \
  src/app/dashboard/investments/loading.tsx \
  src/app/dashboard/investments/error.tsx \
  src/app/dashboard/categories/page.tsx \
  src/app/dashboard/categories/loading.tsx \
  src/app/dashboard/categories/error.tsx \
  src/app/dashboard/accounts/page.tsx \
  src/components/investments/investments-cockpit.ts \
  src/components/investments/InvestmentsCockpitIntro.tsx \
  src/components/investments/HoldingsRoster.tsx \
  src/components/categories/categories-cockpit.ts \
  src/components/categories/CategoriesCockpitIntro.tsx \
  src/components/categories/CategoryStructureGrid.tsx \
  src/components/OtherAssetsSection.tsx \
  src/lib/widget-registry.ts \
  e2e/cockpit-responsive.spec.ts
```

Expected:
- Vitest: PASS for the 5 new unit/component suites.
- Playwright: PASS with the investments and categories routes added to responsive coverage and no overflow failures.
- TypeScript: PASS with no type errors.
- ESLint: PASS on the touched cockpit files.

- [ ] **Step 5: Commit the QA coverage and final polish**

```bash
git add e2e/cockpit-responsive.spec.ts
git commit -m "test: extend portfolio cockpit responsive QA"
```

## Self-Review Checklist

- Spec coverage:
  - Investments hero, primary action, priority stack, hybrid holdings roster, calmer loading/error states, and secondary AI framing are covered by Tasks 1 and 2.
  - Categories hero, primary action, priority stack, structure-first layout order, calmer loading/error states, and admin-to-structure card shift are covered by Task 3.
  - Other Assets portfolio-support framing and calmer empty state are covered by Task 4.
  - Responsive QA for `/dashboard/investments` and `/dashboard/categories` is covered by Task 5.
- Placeholder scan:
  - No `TBD`, `TODO`, `implement later`, or `similar to Task N` placeholders remain.
  - Every code-changing step includes a concrete code sample.
- Type consistency:
  - Investments helper is named `buildInvestmentsCockpitModel` in both tests and implementation.
  - Categories helper is named `buildCategoriesCockpitModel` in both tests and implementation.
  - The hybrid holdings component is named `HoldingsRoster` everywhere in the plan.
