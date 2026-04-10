import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardCashflowForecast } from "./DashboardCashflowForecast";
import type { CashflowForecast } from "@/lib/cashflow-forecast";

const meta = {
  title: "Dashboard/CashflowForecast",
  component: DashboardCashflowForecast,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardCashflowForecast>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseForecast: CashflowForecast = {
  baseCurrency: "GBP",
  periodLabel: "April 2026",
  isCurrentMonth: true,
  daysRemaining: 12,
  daysInMonth: 30,
  projectedIncome: 3800,
  projectedExpenses: 2600,
  projectedNet: 1200,
  actualIncome: 3200,
  actualExpenses: 1800,
  recurringIncome: 3200,
  recurringExpenses: 1400,
  subscriptionCost: 86,
  avgMonthlyIncome: 3600,
  avgMonthlyExpenses: 2500,
  confidence: "high",
  breakdown: [
    { label: "Salary", amount: 3200, type: "income" },
    { label: "Rent", amount: 950, type: "expense" },
    { label: "Netflix", amount: 15.99, type: "expense" },
    { label: "Gym", amount: 35, type: "expense" },
  ],
  recentMonths: [
    { month: "2026-01", income: 3600, expenses: 2400, net: 1200 },
    { month: "2026-02", income: 3600, expenses: 2800, net: 800 },
    { month: "2026-03", income: 3800, expenses: 2300, net: 1500 },
    { month: "2026-04", income: 3800, expenses: 2600, net: 1200 },
  ],
};

export const HighConfidence: Story = {
  args: { forecast: baseForecast },
};

export const MediumConfidence: Story = {
  args: {
    forecast: { ...baseForecast, confidence: "medium" },
  },
};

export const LowConfidence: Story = {
  args: {
    forecast: { ...baseForecast, confidence: "low" },
  },
};

export const NegativeNet: Story = {
  name: "Negative Projected Net",
  args: {
    forecast: {
      ...baseForecast,
      projectedExpenses: 4200,
      projectedNet: -400,
    },
  },
};
