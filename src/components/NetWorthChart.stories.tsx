import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NetWorthChart } from "./NetWorthChart";

const meta = {
  title: "Charts/NetWorthChart",
  component: NetWorthChart,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NetWorthChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const generate = (months: number) =>
  Array.from({ length: months }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (months - 1 - i));
    const base = 30000 + i * 1500 + Math.round(Math.random() * 2000);
    return {
      date: d.toISOString().slice(0, 10),
      net_worth: base,
      total_assets: base + 8000,
      total_liabilities: 8000,
      investment_value: Math.round(base * 0.4),
    };
  });

export const SixMonths: Story = {
  args: { data: generate(6), currency: "GBP" },
};

export const TwelveMonths: Story = {
  args: { data: generate(12), currency: "GBP" },
};

export const Empty: Story = {
  args: { data: [], currency: "GBP" },
};
