import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TransactionFormDialog } from "./AddTransactionForm";

const meta = {
  title: "Forms/AddTransactionForm",
  component: TransactionFormDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof TransactionFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    accounts: [
      { id: "a1", accountName: "Main Current" },
      { id: "a2", accountName: "Savings" },
    ] as any[],
    categories: [
      { id: "c1", name: "Groceries", color: "#34C759", icon: null, user_id: "u1" },
      { id: "c2", name: "Transport", color: "#007AFF", icon: null, user_id: "u1" },
      { id: "c3", name: "Eating Out", color: "#FF9500", icon: null, user_id: "u1" },
    ],
  },
};
