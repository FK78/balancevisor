import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InvestmentCharts } from "./InvestmentCharts";

const meta = {
  title: "Charts/InvestmentCharts",
  component: InvestmentCharts,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[700px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof InvestmentCharts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currency: "GBP",
    holdings: [
      { id: "h1", ticker: "AAPL", name: "Apple Inc", value: 8500, gainLoss: 1200, gainLossPercent: 16.4 },
      { id: "h2", ticker: "VWRL", name: "Vanguard All-World", value: 12000, gainLoss: 800, gainLossPercent: 7.1 },
      { id: "h3", ticker: "BTC", name: "Bitcoin", value: 4200, gainLoss: -350, gainLossPercent: -7.7 },
      { id: "h4", ticker: null, name: "Private Equity Fund", value: 5000, gainLoss: 0, gainLossPercent: 0 },
    ],
  },
};
