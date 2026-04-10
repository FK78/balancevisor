import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { SummaryCard } from "./SummaryCard";

const meta = {
  title: "Cards/SummaryCard",
  component: SummaryCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[280px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NetWorth: Story = {
  args: {
    title: "Net Worth",
    description: "Total across all accounts",
    value: "£42,350.00",
    change: "+£1,200 from last month",
    icon: Wallet,
    color: "text-emerald-600",
  },
};

export const Income: Story = {
  args: {
    title: "Income",
    description: "This month",
    value: "£3,800.00",
    change: "+12% vs last month",
    icon: TrendingUp,
    color: "text-emerald-600",
  },
};

export const Expenses: Story = {
  args: {
    title: "Expenses",
    description: "This month",
    value: "£2,150.00",
    change: "-5% vs last month",
    icon: TrendingDown,
    color: "text-rose-600",
  },
};

export const Savings: Story = {
  args: {
    title: "Savings Rate",
    description: "Percentage saved",
    value: "43%",
    change: "Above target of 30%",
    icon: PiggyBank,
    color: "text-primary",
  },
};
