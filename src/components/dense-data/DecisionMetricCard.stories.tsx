import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/ui/button";
import { DecisionMetricCard } from "./DecisionMetricCard";

const meta = {
  title: "Dense Data/DecisionMetricCard",
  component: DecisionMetricCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DecisionMetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Full: Story = {
  args: {
    eyebrow: "Savings Rate",
    title: "32.4%",
    subtitle: "Up from 28.1% last month",
    interpretation: "Excellent — you're saving more than the recommended 20% target.",
  },
};

export const Minimal: Story = {
  args: {
    eyebrow: "Net Worth",
    title: "£42,350",
  },
};

export const WithAction: Story = {
  args: {
    eyebrow: "Budget Status",
    title: "3 of 5 on track",
    subtitle: "Groceries and Transport are over budget.",
    interpretation: "Consider reducing discretionary spend this week.",
    action: <Button size="sm" variant="outline">View Budgets</Button>,
  },
};
