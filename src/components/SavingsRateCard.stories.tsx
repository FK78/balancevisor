import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SavingsRateCard } from "./SavingsRateCard";
import type { MonthlySavingsRate } from "@/lib/savings-rate";

const meta = {
  title: "Cards/SavingsRateCard",
  component: SavingsRateCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SavingsRateCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const makeRates = (): MonthlySavingsRate[] => [
  { month: "2026-01", income: 3600, expenses: 2400, net: 1200, rate: 33.3 },
  { month: "2026-02", income: 3600, expenses: 2800, net: 800, rate: 22.2 },
  { month: "2026-03", income: 3800, expenses: 2300, net: 1500, rate: 39.5 },
  { month: "2026-04", income: 3200, expenses: 2600, net: 600, rate: 18.8 },
  { month: "2026-05", income: 3600, expenses: 2100, net: 1500, rate: 41.7 },
  { month: "2026-06", income: 3800, expenses: 2500, net: 1300, rate: 34.2 },
];

export const Default: Story = {
  args: { rates: makeRates() },
};
