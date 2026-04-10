import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardBudgetProgress } from "./DashboardBudgetProgress";

const meta = {
  title: "Dashboard/BudgetProgress",
  component: DashboardBudgetProgress,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardBudgetProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

const BUDGETS = [
  { id: "b1", budgetCategory: "Groceries", budgetAmount: 400, budgetSpent: 310 },
  { id: "b2", budgetCategory: "Transport", budgetAmount: 150, budgetSpent: 165 },
  { id: "b3", budgetCategory: "Entertainment", budgetAmount: 100, budgetSpent: 85 },
  { id: "b4", budgetCategory: "Eating Out", budgetAmount: 200, budgetSpent: 120 },
  { id: "b5", budgetCategory: "Shopping", budgetAmount: 250, budgetSpent: 248 },
];

export const MixedProgress: Story = {
  args: {
    budgets: BUDGETS,
    budgetsAtRisk: BUDGETS.filter((b) => b.budgetSpent >= b.budgetAmount * 0.8),
    currency: "GBP",
  },
};

export const AllOnTrack: Story = {
  args: {
    budgets: BUDGETS.map((b) => ({ ...b, budgetSpent: Math.round(b.budgetAmount * 0.4) })),
    budgetsAtRisk: [],
    currency: "GBP",
  },
};

export const AllOverBudget: Story = {
  args: {
    budgets: BUDGETS.map((b) => ({ ...b, budgetSpent: Math.round(b.budgetAmount * 1.3) })),
    budgetsAtRisk: BUDGETS,
    currency: "GBP",
  },
};

export const Empty: Story = {
  args: {
    budgets: [],
    budgetsAtRisk: [],
    currency: "GBP",
  },
};
