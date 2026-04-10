import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardNetWorth } from "./DashboardNetWorth";

const meta = {
  title: "Dashboard/NetWorth",
  component: DashboardNetWorth,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardNetWorth>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Positive: Story = {
  args: {
    netWorth: 42_350,
    totalAssets: 55_000,
    totalLiabilities: 12_650,
    investmentValue: 28_500,
    currency: "GBP",
  },
};

export const NegativeNetWorth: Story = {
  args: {
    netWorth: -3_200,
    totalAssets: 9_800,
    totalLiabilities: 13_000,
    investmentValue: 0,
    currency: "GBP",
  },
};

export const NoInvestments: Story = {
  args: {
    netWorth: 12_400,
    totalAssets: 15_000,
    totalLiabilities: 2_600,
    investmentValue: 0,
    currency: "GBP",
  },
};
