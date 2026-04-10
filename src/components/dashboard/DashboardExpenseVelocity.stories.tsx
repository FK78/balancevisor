import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardExpenseVelocity } from "./DashboardExpenseVelocity";
import type { CashflowForecast } from "@/lib/cashflow-forecast";

const meta = {
  title: "Dashboard/ExpenseVelocity",
  component: DashboardExpenseVelocity,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[380px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardExpenseVelocity>;

export default meta;
type Story = StoryObj<typeof meta>;

const base: CashflowForecast = {
  baseCurrency: "GBP",
  periodLabel: "April 2026",
  isCurrentMonth: true,
  daysRemaining: 12,
  daysInMonth: 30,
  projectedIncome: 3800,
  projectedExpenses: 2600,
  projectedNet: 1200,
  actualIncome: 3200,
  actualExpenses: 1200,
  recurringIncome: 3200,
  recurringExpenses: 1400,
  subscriptionCost: 86,
  avgMonthlyIncome: 3600,
  avgMonthlyExpenses: 2500,
  confidence: "high",
  breakdown: [],
  recentMonths: [],
};

export const UnderBudget: Story = {
  args: {
    forecast: { ...base, actualExpenses: 900, avgMonthlyExpenses: 2500 },
  },
};

export const OnPace: Story = {
  args: {
    forecast: { ...base, actualExpenses: 1500, avgMonthlyExpenses: 2500 },
  },
};

export const OverBudget: Story = {
  args: {
    forecast: { ...base, actualExpenses: 2200, avgMonthlyExpenses: 2500 },
  },
};
