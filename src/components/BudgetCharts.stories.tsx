import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BudgetCharts } from "./BudgetCharts";

const meta = {
  title: "Charts/BudgetCharts",
  component: BudgetCharts,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BudgetCharts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    budgets: [
      { id: "b1", budgetCategory: "Groceries", budgetColor: "#34C759", budgetAmount: 400, budgetSpent: 285 },
      { id: "b2", budgetCategory: "Transport", budgetColor: "#007AFF", budgetAmount: 100, budgetSpent: 112 },
      { id: "b3", budgetCategory: "Eating Out", budgetColor: "#FF9500", budgetAmount: 150, budgetSpent: 90 },
      { id: "b4", budgetCategory: "Entertainment", budgetColor: "#AF52DE", budgetAmount: 80, budgetSpent: 75 },
    ],
    currency: "GBP",
  },
};
