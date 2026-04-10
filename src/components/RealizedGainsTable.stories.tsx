import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RealizedGainsTable } from "./RealizedGainsTable";

const meta = {
  title: "Data Display/RealizedGainsTable",
  component: RealizedGainsTable,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[700px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RealizedGainsTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSales: Story = {
  args: {
    baseCurrency: "GBP",
    sales: [
      {
        id: "s1",
        holding_id: "h1",
        date: "2026-03-15",
        quantity: 10,
        price_per_unit: 155.0,
        total_amount: 1550,
        realized_gain: 320,
        cash_account_id: "a1",
        notes: null,
        created_at: new Date("2026-03-15"),
        holding: { ticker: "AAPL", name: "Apple Inc", investment_type: "stock", currency: "GBP" },
        cashAccountName: "Main Current",
      },
      {
        id: "s2",
        holding_id: "h2",
        date: "2026-02-20",
        quantity: 0.5,
        price_per_unit: 42000,
        total_amount: 21000,
        realized_gain: -1200,
        cash_account_id: null,
        notes: "Partial exit",
        created_at: new Date("2026-02-20"),
        holding: { ticker: "BTC", name: "Bitcoin", investment_type: "crypto", currency: "GBP" },
        cashAccountName: null,
      },
    ],
  },
};

export const Empty: Story = {
  args: { baseCurrency: "GBP", sales: [] },
};
