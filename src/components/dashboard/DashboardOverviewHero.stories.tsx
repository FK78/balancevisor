import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardOverviewHero } from "./DashboardOverviewHero";

const meta = {
  title: "Dashboard/OverviewHero",
  component: DashboardOverviewHero,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardOverviewHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Wealthy: Story = {
  args: {
    displayName: "Fahad",
    monthName: "April",
    netWorth: 125_400,
    totalAssets: 148_200,
    totalLiabilities: 22_800,
    investmentValue: 62_500,
    currency: "GBP",
  },
};

export const Negative: Story = {
  name: "Negative Net Worth",
  args: {
    displayName: "Alex",
    monthName: "March",
    netWorth: -4_200,
    totalAssets: 8_600,
    totalLiabilities: 12_800,
    investmentValue: 0,
    currency: "GBP",
  },
};

export const ZeroInvestments: Story = {
  args: {
    displayName: "Sam",
    monthName: "February",
    netWorth: 15_000,
    totalAssets: 18_000,
    totalLiabilities: 3_000,
    investmentValue: 0,
    currency: "GBP",
  },
};
