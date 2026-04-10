import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SubscriptionFormDialog } from "./SubscriptionFormDialog";

const meta = {
  title: "Forms/SubscriptionFormDialog",
  component: SubscriptionFormDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof SubscriptionFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockCategories = [
  { id: "c1", name: "Entertainment", color: "#AF52DE", icon: null, user_id: "u1" },
  { id: "c2", name: "Productivity", color: "#007AFF", icon: null, user_id: "u1" },
  { id: "c3", name: "Health", color: "#34C759", icon: null, user_id: "u1" },
];

const mockAccounts = [
  { id: "a1", accountName: "Main Current" },
  { id: "a2", accountName: "Savings" },
] as any[];

export const CreateMode: Story = {
  args: {
    categories: mockCategories,
    accounts: mockAccounts,
  },
};

export const EditMode: Story = {
  args: {
    subscription: {
      id: "sub-1",
      name: "Netflix",
      amount: 15.99,
      currency: "GBP",
      billing_cycle: "monthly",
      next_billing_date: "2026-04-15",
      category_id: "c1",
      account_id: "a1",
      url: "https://netflix.com",
      notes: null,
      color: "#E50914",
      icon: null,
    },
    categories: mockCategories,
    accounts: mockAccounts,
  },
};
