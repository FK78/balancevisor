import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardAnomalies } from "./DashboardAnomalies";

const meta = {
  title: "Dashboard/Anomalies",
  component: DashboardAnomalies,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardAnomalies>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultipleAnomalies: Story = {
  args: {
    anomalies: [
      { category: "Eating Out", color: "#FF9500", currentSpend: 420, avgSpend: 240, pctAbove: 75, increaseAmount: 180 },
      { category: "Shopping", color: "#AF52DE", currentSpend: 380, avgSpend: 250, pctAbove: 52, increaseAmount: 130 },
      { category: "Transport", color: "#007AFF", currentSpend: 210, avgSpend: 140, pctAbove: 50, increaseAmount: 70 },
    ],
    currency: "GBP",
  },
};

export const SingleAnomaly: Story = {
  args: {
    anomalies: [
      { category: "Groceries", color: "#34C759", currentSpend: 650, avgSpend: 400, pctAbove: 62, increaseAmount: 250 },
    ],
    currency: "GBP",
  },
};
