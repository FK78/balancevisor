import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SpendCategoryRow } from "./SpendCategoryRow";

const meta = {
  title: "Data Display/SpendCategoryRow",
  component: SpendCategoryRow,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[360px] space-y-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SpendCategoryRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HighSpend: Story = {
  args: {
    category: "Groceries",
    total: "450",
    color: "#34C759",
    totalExpenses: 2000,
    currency: "GBP",
  },
};

export const MediumSpend: Story = {
  args: {
    category: "Transport",
    total: "180",
    color: "#007AFF",
    totalExpenses: 2000,
    currency: "GBP",
  },
};

export const LowSpend: Story = {
  args: {
    category: "Entertainment",
    total: "45",
    color: "#AF52DE",
    totalExpenses: 2000,
    currency: "GBP",
  },
};

export const ZeroSpend: Story = {
  args: {
    category: "Gifts",
    total: "0",
    color: "#FF9500",
    totalExpenses: 2000,
    currency: "GBP",
  },
};

export const MultipleRows: Story = {
  args: {
    category: "Groceries",
    total: "450",
    color: "#34C759",
    totalExpenses: 2000,
    currency: "GBP",
  },
  decorators: [
    () => (
      <div className="w-[360px] space-y-3">
        <SpendCategoryRow category="Groceries" total="450" color="#34C759" totalExpenses={2000} currency="GBP" />
        <SpendCategoryRow category="Transport" total="320" color="#007AFF" totalExpenses={2000} currency="GBP" />
        <SpendCategoryRow category="Eating Out" total="280" color="#FF9500" totalExpenses={2000} currency="GBP" />
        <SpendCategoryRow category="Entertainment" total="150" color="#AF52DE" totalExpenses={2000} currency="GBP" />
        <SpendCategoryRow category="Shopping" total="95" color="#FF2D55" totalExpenses={2000} currency="GBP" />
      </div>
    ),
  ],
};
