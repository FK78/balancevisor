import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardZakatSummary } from "./DashboardZakatSummary";

const meta = {
  title: "Dashboard/ZakatSummary",
  component: DashboardZakatSummary,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardZakatSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoSettings: Story = {
  name: "Setup CTA",
  args: {
    zakatDue: 0,
    zakatableAmount: 0,
    aboveNisab: false,
    daysUntil: null,
    hasSettings: false,
    baseCurrency: "GBP",
  },
};

export const AboveNisab: Story = {
  args: {
    zakatDue: 1_875,
    zakatableAmount: 75_000,
    aboveNisab: true,
    daysUntil: 42,
    hasSettings: true,
    baseCurrency: "GBP",
  },
};

export const BelowNisab: Story = {
  args: {
    zakatDue: 0,
    zakatableAmount: 2_800,
    aboveNisab: false,
    daysUntil: 42,
    hasSettings: true,
    baseCurrency: "GBP",
  },
};

export const DueSoon: Story = {
  name: "Due in 5 days",
  args: {
    zakatDue: 1_250,
    zakatableAmount: 50_000,
    aboveNisab: true,
    daysUntil: 5,
    hasSettings: true,
    baseCurrency: "GBP",
  },
};
