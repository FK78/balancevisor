// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactionsClient } from "@/components/TransactionsClient";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
  }),
}));

vi.mock("next/dynamic", () => ({
  default: (_loader: unknown, options?: { loading?: () => React.ReactNode }) => {
    const MockDynamic = () => (options?.loading ? options.loading() : null);
    return MockDynamic;
  },
}));

vi.mock("@/components/AiSettingsProvider", () => ({
  useAiEnabled: () => true,
}));

vi.mock("@/components/AddTransactionForm", () => ({
  TransactionFormDialog: () => <button type="button">Add transaction</button>,
}));

vi.mock("@/components/QuickAddTransaction", () => ({
  QuickAddTransaction: () => <button type="button">Quick add</button>,
}));

vi.mock("@/components/AddTransferForm", () => ({
  TransferFormDialog: () => <button type="button">Transfer</button>,
}));

vi.mock("@/components/ImportCSVDialog", () => ({
  ImportCSVDialog: () => <button type="button">Import CSV</button>,
}));

vi.mock("@/components/SplitTransactionDialog", () => ({
  SplitTransactionDialog: () => <button type="button">Split transaction</button>,
}));

vi.mock("@/components/transactions/TransactionColumns", () => ({
  useTransactionColumns: () => [],
}));

vi.mock("@tanstack/react-table", () => ({
  flexRender: () => null,
  getCoreRowModel: () => () => ({ rows: [] }),
  getSortedRowModel: () => () => ({ rows: [] }),
  useReactTable: () => ({
    getRowModel: () => ({ rows: [] }),
    getHeaderGroups: () => [],
  }),
}));

describe("TransactionsClient", () => {
  beforeEach(() => {
    mockPush.mockReset();
  });

  it("switches between feed, search, and review workspaces", async () => {
    const user = userEvent.setup();

    render(
      <TransactionsClient
        transactions={[
          {
            id: "txn_1",
            accountName: "Main Account",
            description: "Tesco",
            category: "Groceries",
            category_id: "cat_1",
            category_source: "manual",
            merchant_name: "Tesco",
            date: "2026-04-10",
            amount: 45.2,
            type: "expense",
            is_split: false,
            is_recurring: false,
            transfer_account_id: null,
          } as never,
        ]}
        accounts={[{ id: "acc_1", accountName: "Main Account" } as never]}
        categories={[{ id: "cat_1", name: "Groceries" } as never]}
        currentPage={1}
        pageSize={10}
        totalTransactions={1}
        totalIncome={0}
        totalExpenses={45.2}
        totalRefunds={0}
        dailyTrend={[]}
        dailyCategoryExpenses={[]}
        currency="GBP"
        splits={{}}
        uncategorisedCount={2}
      />,
    );

    expect(screen.getByRole("tab", { name: "Feed" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Recent Transactions")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Search" }));

    expect(screen.getByRole("button", { name: "Open filters" })).toBeInTheDocument();
    expect(screen.queryByText("Recent Transactions")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Review" }));

    expect(screen.getByText("Transactions to review")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /categorise 2/i })).toBeInTheDocument();
  });

  it("opens the filter sheet from the search workspace", async () => {
    const user = userEvent.setup();

    render(
      <TransactionsClient
        transactions={[]}
        accounts={[{ id: "acc_1", accountName: "Main Account" } as never]}
        categories={[{ id: "cat_1", name: "Groceries" } as never]}
        currentPage={1}
        pageSize={10}
        totalTransactions={0}
        totalIncome={0}
        totalExpenses={0}
        totalRefunds={0}
        dailyTrend={[]}
        dailyCategoryExpenses={[]}
        currency="GBP"
        splits={{}}
        uncategorisedCount={0}
      />,
    );

    await user.click(screen.getByRole("tab", { name: "Search" }));
    await user.click(screen.getByRole("button", { name: "Open filters" }));

    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(screen.getByLabelText("From")).toBeInTheDocument();
    expect(screen.getByLabelText("To")).toBeInTheDocument();
  });

  it("shows removable search filter chips and result summary in search workspace", async () => {
    const user = userEvent.setup();

    render(
      <TransactionsClient
        transactions={[
          {
            id: "txn_1",
            accountName: "Main Account",
            description: "Tesco",
            category: "Groceries",
            category_id: "cat_1",
            category_source: "manual",
            merchant_name: "Tesco",
            date: "2026-04-10",
            amount: 45.2,
            type: "expense",
            is_split: false,
            is_recurring: false,
            transfer_account_id: null,
          } as never,
        ]}
        accounts={[{ id: "acc_1", accountName: "Main Account" } as never]}
        categories={[{ id: "cat_1", name: "Groceries" } as never]}
        currentPage={1}
        pageSize={10}
        totalTransactions={1}
        totalIncome={0}
        totalExpenses={45.2}
        totalRefunds={0}
        startDate="2026-04-01"
        endDate="2026-04-10"
        search="tesco"
        accountId="acc_1"
        dailyTrend={[]}
        dailyCategoryExpenses={[]}
        currency="GBP"
        splits={{}}
        uncategorisedCount={0}
      />,
    );

    await user.click(screen.getByRole("tab", { name: "Search" }));

    expect(screen.getByText("Showing 1 transaction")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove search filter tesco" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove account filter Main Account" }),
    ).toBeInTheDocument();
  });

  it("shows uncategorised transactions as decision rows in review workspace", async () => {
    const user = userEvent.setup();

    render(
      <TransactionsClient
        transactions={[
          {
            id: "txn_1",
            accountName: "Main Account",
            description: "Tesco",
            category: null,
            category_id: null,
            category_source: null,
            merchant_name: "Tesco",
            date: "2026-04-10",
            amount: 45.2,
            type: "expense",
            is_split: false,
            is_recurring: false,
            transfer_account_id: null,
          } as never,
        ]}
        accounts={[{ id: "acc_1", accountName: "Main Account" } as never]}
        categories={[{ id: "cat_1", name: "Groceries" } as never]}
        currentPage={1}
        pageSize={10}
        totalTransactions={1}
        totalIncome={0}
        totalExpenses={45.2}
        totalRefunds={0}
        dailyTrend={[]}
        dailyCategoryExpenses={[]}
        currency="GBP"
        splits={{}}
        uncategorisedCount={1}
      />,
    );

    await user.click(screen.getByRole("tab", { name: "Review" }));

    expect(screen.getByRole("heading", { level: 3, name: "Tesco" })).toBeInTheDocument();
    expect(screen.getByText("Needs review")).toBeInTheDocument();
  });
});
