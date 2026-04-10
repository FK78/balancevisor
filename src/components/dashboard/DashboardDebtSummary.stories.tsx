import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DashboardDebtSummary } from "./DashboardDebtSummary";

const meta = {
  title: "Dashboard/DebtSummary",
  component: DashboardDebtSummary,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[420px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DashboardDebtSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultipleDebts: Story = {
  args: {
    debtSummary: {
      activeCount: 3,
      totalRemaining: 18_400,
      totalMinimumPayment: 650,
      overallPct: 42,
      active: [
        { id: "d1", name: "Student Loan", original_amount: 25000, remaining_amount: 12000, color: "#007AFF" },
        { id: "d2", name: "Car Finance", original_amount: 8000, remaining_amount: 4200, color: "#FF9500" },
        { id: "d3", name: "Credit Card", original_amount: 3000, remaining_amount: 2200, color: "#FF2D55" },
      ],
    },
    currency: "GBP",
  },
};

export const AlmostPaidOff: Story = {
  args: {
    debtSummary: {
      activeCount: 1,
      totalRemaining: 320,
      totalMinimumPayment: 100,
      overallPct: 94,
      active: [
        { id: "d1", name: "Credit Card", original_amount: 5000, remaining_amount: 320, color: "#34C759" },
      ],
    },
    currency: "GBP",
  },
};
