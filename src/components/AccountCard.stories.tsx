import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AccountCard } from "./AccountCard";

const meta = {
  title: "Cards/AccountCard",
  component: AccountCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccountCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CurrentAccount: Story = {
  args: {
    account: {
      id: "acc-1",
      accountName: "Main Current Account",
      type: "currentAccount",
      balance: 4250.75,
      transactions: 142,
      isShared: false,
    },
    currency: "GBP",
    totalAbsoluteBalance: 50000,
  },
};

export const SavingsAccount: Story = {
  args: {
    account: {
      id: "acc-2",
      accountName: "Emergency Fund",
      type: "savings",
      balance: 12000,
      transactions: 8,
      isShared: false,
    },
    currency: "GBP",
    totalAbsoluteBalance: 50000,
  },
};

export const CreditCardNegative: Story = {
  name: "Credit Card (Liability)",
  args: {
    account: {
      id: "acc-3",
      accountName: "Amex Platinum",
      type: "creditCard",
      balance: -1820.5,
      transactions: 37,
      isShared: false,
    },
    currency: "GBP",
    totalAbsoluteBalance: 50000,
  },
};

export const InvestmentAccount: Story = {
  args: {
    account: {
      id: "acc-4",
      accountName: "Stocks & Shares ISA",
      type: "investment",
      balance: 28500,
      transactions: 12,
      isShared: false,
    },
    currency: "GBP",
    totalAbsoluteBalance: 50000,
  },
};

export const SharedAccount: Story = {
  args: {
    account: {
      id: "acc-5",
      accountName: "Joint Account",
      type: "currentAccount",
      balance: 3200,
      transactions: 65,
      isShared: false,
    },
    currency: "GBP",
    totalAbsoluteBalance: 50000,
    shareCount: 1,
  },
};

export const ZeroBalance: Story = {
  args: {
    account: {
      id: "acc-6",
      accountName: "Old Savings",
      type: "savings",
      balance: 0,
      transactions: 0,
      isShared: false,
    },
    currency: "GBP",
    totalAbsoluteBalance: 50000,
  },
};
