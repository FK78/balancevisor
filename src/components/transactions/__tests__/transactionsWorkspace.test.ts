import { describe, expect, it } from "vitest";
import { getInitialTransactionsWorkspaceTab } from "@/components/transactions/transactions-workspace";

describe("getInitialTransactionsWorkspaceTab", () => {
  it("prefers the search workspace when a search or filter is active", () => {
    expect(getInitialTransactionsWorkspaceTab({
      search: "tesco",
      startDate: undefined,
      endDate: undefined,
      accountId: undefined,
      uncategorisedCount: 0,
    })).toBe("search");

    expect(getInitialTransactionsWorkspaceTab({
      search: undefined,
      startDate: "2026-04-01",
      endDate: undefined,
      accountId: undefined,
      uncategorisedCount: 0,
    })).toBe("search");
  });

  it("falls back to feed when no search state is active", () => {
    expect(getInitialTransactionsWorkspaceTab({
      search: undefined,
      startDate: undefined,
      endDate: undefined,
      accountId: undefined,
      uncategorisedCount: 3,
    })).toBe("feed");
  });
});
