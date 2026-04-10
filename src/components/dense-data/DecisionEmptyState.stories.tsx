import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/ui/button";
import { DecisionEmptyState } from "./DecisionEmptyState";

const meta = {
  title: "Dense Data/DecisionEmptyState",
  component: DecisionEmptyState,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DecisionEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "No budgets yet",
    description: "Create a budget to start tracking your spending against targets.",
  },
};

export const WithAction: Story = {
  args: {
    title: "No transactions found",
    description: "Import your bank transactions or add them manually to get started.",
    action: <Button size="sm">Import Transactions</Button>,
  },
};
