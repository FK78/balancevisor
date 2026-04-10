import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardRetirement } from "./DashboardRetirement";

const meta = {
  title: "Dashboard/Retirement",
  component: DashboardRetirement,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[480px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardRetirement>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoProfile: Story = {
  name: "Setup CTA (no profile)",
  args: {
    projection: null,
    hasProfile: false,
    baseCurrency: "GBP",
  },
};

export const OnTrack: Story = {
  args: {
    projection: {
      estimatedRetirementAge: 58,
      yearsToRetirement: 25,
      targetRetirementAge: 60,
      canRetireOnTarget: true,
      requiredFundAtTarget: 750000,
      projectedFundAtTarget: 820000,
      fundGap: -70000,
      fundProgress: 78,
      currentNetWorth: 125000,
      annualSavings: 18000,
      monthlySavings: 1500,
      savingsRate: 32,
      yearlyProjection: [],
      scenarios: [],
    },
    hasProfile: true,
    baseCurrency: "GBP",
  },
};

export const NeedsAttention: Story = {
  args: {
    projection: {
      estimatedRetirementAge: 68,
      yearsToRetirement: 35,
      targetRetirementAge: 60,
      canRetireOnTarget: false,
      requiredFundAtTarget: 750000,
      projectedFundAtTarget: 420000,
      fundGap: 330000,
      fundProgress: 35,
      currentNetWorth: 42000,
      annualSavings: 6000,
      monthlySavings: 500,
      savingsRate: 12,
      yearlyProjection: [],
      scenarios: [],
    },
    hasProfile: true,
    baseCurrency: "GBP",
  },
};
