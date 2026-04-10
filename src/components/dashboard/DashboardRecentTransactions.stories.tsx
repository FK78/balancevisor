import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardRecentTransactions } from "./DashboardRecentTransactions";
import type { TransactionWithDetails } from "@/lib/types";

const meta = {
  title: "Dashboard/RecentTransactions",
  component: DashboardRecentTransactions,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardRecentTransactions>;

export default meta;
type Story = StoryObj<typeof meta>;

const makeTxn = (overrides: Partial<TransactionWithDetails>): TransactionWithDetails => ({
  id: "t1",
  description: "Tesco Express",
  amount: -42.5,
  date: "2026-04-08",
  type: "expense",
  category_id: "cat-1",
  category: "Groceries",
  account_id: "acc-1",
  accountName: "Main Current",
  is_recurring: false,
  is_split: false,
  transfer_account_id: null,
  refund_for_transaction_id: null,
  category_source: null,
  merchant_name: null,
  ...overrides,
});

export const WithTransactions: Story = {
  args: {
    transactions: [
      makeTxn({ id: "t1", description: "Tesco Express", amount: -42.5, category: "Groceries", date: "2026-04-08" }),
      makeTxn({ id: "t2", description: "TfL Contactless", amount: -8.4, category: "Transport", date: "2026-04-07" }),
      makeTxn({ id: "t3", description: "Amazon Prime", amount: -8.99, category: "Subscriptions", date: "2026-04-06" }),
      makeTxn({ id: "t4", description: "Salary", amount: 3200, type: "income", category: "Income", date: "2026-04-01" }),
    ],
    currency: "GBP",
  },
};

export const Empty: Story = {
  args: {
    transactions: [],
    currency: "GBP",
  },
};
