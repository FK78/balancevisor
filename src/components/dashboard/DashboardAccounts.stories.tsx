import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardAccounts } from "./DashboardAccounts";

const meta = {
  title: "Dashboard/Accounts",
  component: DashboardAccounts,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[700px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardAccounts>;

export default meta;
type Story = StoryObj<typeof meta>;

const makeAccount = (overrides: Record<string, unknown>) => ({
  id: "acc-1",
  accountName: "Main Account",
  name: "Main Account",
  type: "currentAccount" as const,
  balance: 4250,
  currency: "GBP",
  user_id: "u1",
  truelayer_id: null,
  truelayer_connection_id: null,
  transactions: 142,
  isShared: false,
  sharedBy: null,
  ...overrides,
});

export const MultipleAccounts: Story = {
  args: {
    accounts: [
      makeAccount({ id: "a1", accountName: "Main Current", name: "Main Current", balance: 4250, type: "currentAccount" }),
      makeAccount({ id: "a2", accountName: "Emergency Fund", name: "Emergency Fund", balance: 12000, type: "savings" }),
      makeAccount({ id: "a3", accountName: "Amex Platinum", name: "Amex Platinum", balance: -1820, type: "creditCard" }),
    ],
    currency: "GBP",
  },
};

export const Empty: Story = {
  args: {
    accounts: [],
    currency: "GBP",
  },
};

export const SingleAccount: Story = {
  args: {
    accounts: [makeAccount({})],
    currency: "GBP",
  },
};
