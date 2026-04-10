import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CashflowCharts } from "./CashflowCharts";

const meta = {
  title: "Charts/CashflowCharts",
  component: CashflowCharts,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[700px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CashflowCharts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: [
      { month: "2025-11", income: 3400, expenses: 2600, refunds: 0, net: 800 },
      { month: "2025-12", income: 3800, expenses: 3200, refunds: 0, net: 600 },
      { month: "2026-01", income: 3600, expenses: 2400, refunds: 0, net: 1200 },
      { month: "2026-02", income: 3600, expenses: 2800, refunds: 50, net: 850 },
      { month: "2026-03", income: 3800, expenses: 2300, refunds: 0, net: 1500 },
      { month: "2026-04", income: 3200, expenses: 2600, refunds: 25, net: 625 },
    ],
    currency: "GBP",
  },
};
