import { beforeEach, describe, expect, it, vi } from "vitest";

const requireFeature = vi.fn();
const getCurrentUserId = vi.fn();
const getBrokerConnections = vi.fn();
const getManualHoldings = vi.fn();
const getUserBaseCurrency = vi.fn();
const getAccountsWithDetails = vi.fn();
const getGroupsByUser = vi.fn();
const getHoldingSales = vi.fn();
const getPageLayout = vi.fn();
const getQuotes = vi.fn();
const buildInvestmentsCockpitModel = vi.fn();
const buildInvestmentsRosterSections = vi.fn();

vi.mock("next/dynamic", () => ({
  default: () => () => null,
}));

vi.mock("@/components/FeatureGate", () => ({
  requireFeature,
}));

vi.mock("@/lib/auth", () => ({
  getCurrentUserId,
}));

vi.mock("@/db/queries/investments", () => ({
  decryptBrokerCredentials: vi.fn(),
  getBrokerConnections,
  getHoldingSales,
  getManualHoldings,
}));

vi.mock("@/db/queries/accounts", () => ({
  getAccountsWithDetails,
}));

vi.mock("@/db/queries/investment-groups", () => ({
  getGroupsByUser,
}));

vi.mock("@/db/queries/onboarding", () => ({
  getUserBaseCurrency,
}));

vi.mock("@/db/queries/dashboard-layouts", () => ({
  getPageLayout,
}));

vi.mock("@/lib/yahoo-finance", () => ({
  getQuotes,
}));

vi.mock("@/components/investments/investments-cockpit", () => ({
  buildInvestmentsCockpitModel,
}));

vi.mock("@/components/investments/investments-roster", () => ({
  buildInvestmentsRosterSections,
}));

describe("dashboard investments page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    requireFeature.mockResolvedValue(undefined);
    getCurrentUserId.mockResolvedValue("user-1");
    getBrokerConnections.mockResolvedValue([]);
    getManualHoldings.mockResolvedValue([
      {
        id: "manual-stale",
        ticker: "AAPL",
        name: "Apple",
        quantity: 2,
        average_price: 100,
        current_price: 110,
        currency: "GBP",
        investment_type: "stock",
        estimated_return_percent: null,
        notes: null,
        account_id: null,
        group_id: null,
        accountName: null,
        last_price_update: new Date("2026-04-11T10:00:00.000Z"),
        created_at: new Date("2026-04-11T09:00:00.000Z"),
      },
    ]);
    getUserBaseCurrency.mockResolvedValue("GBP");
    getAccountsWithDetails.mockResolvedValue([]);
    getGroupsByUser.mockResolvedValue([]);
    getHoldingSales.mockResolvedValue([]);
    getPageLayout.mockResolvedValue([]);
    getQuotes.mockResolvedValue(new Map());
    buildInvestmentsCockpitModel.mockReturnValue({
      heroTitle: "Test",
      heroDescription: "Test",
      primaryAction: { key: "add-holding", label: "Add holding", description: "Test" },
      priorityCards: [],
      accountSections: [],
    });
    buildInvestmentsRosterSections.mockReturnValue([]);
  });

  it("marks stale manual holdings as pending when the quote refresh fails", async () => {
    const page = (await import("@/app/dashboard/investments/page")).default;

    await page();

    expect(getQuotes).toHaveBeenCalledWith(["AAPL"]);
    expect(buildInvestmentsCockpitModel).toHaveBeenCalledWith(
      expect.objectContaining({
        holdings: expect.arrayContaining([
          expect.objectContaining({
            id: "manual-manual-stale",
            pricePending: true,
          }),
        ]),
      }),
    );
  });
});
