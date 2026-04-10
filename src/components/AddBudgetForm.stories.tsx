import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BudgetFormDialog } from "./AddBudgetForm";

const meta = {
  title: "Forms/BudgetFormDialog",
  component: BudgetFormDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof BudgetFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockCategories = [
  { id: "c1", name: "Groceries", color: "#34C759" },
  { id: "c2", name: "Transport", color: "#007AFF" },
  { id: "c3", name: "Eating Out", color: "#FF9500" },
];

export const CreateMode: Story = {
  args: {
    categories: mockCategories,
    avgSpendByCategory: { c1: 320, c2: 85, c3: 140 },
  },
};

export const EditMode: Story = {
  args: {
    categories: mockCategories,
    budget: {
      id: "b1",
      budgetCategory: "Groceries",
      budgetColor: "#34C759",
      budgetAmount: 400,
      budgetSpent: 285,
      budgetPeriod: "monthly",
      category_id: "c1",
      start_date: "2026-04-01",
    },
  },
};
