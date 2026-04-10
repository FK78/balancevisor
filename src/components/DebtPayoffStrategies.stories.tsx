import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DebtPayoffStrategies } from "./DebtPayoffStrategies";

const meta = {
  title: "Charts/DebtPayoffStrategies",
  component: DebtPayoffStrategies,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[700px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DebtPayoffStrategies>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    debts: [
      { id: "d1", name: "Student Loan", remaining_amount: 12000, interest_rate: 4.5, minimum_payment: 250, color: "#007AFF" },
      { id: "d2", name: "Credit Card", remaining_amount: 3200, interest_rate: 19.9, minimum_payment: 80, color: "#FF2D55" },
      { id: "d3", name: "Car Finance", remaining_amount: 8500, interest_rate: 6.2, minimum_payment: 200, color: "#FF9500" },
    ],
    totalMinimumPayment: 530,
    currency: "GBP",
  },
};

export const SingleDebt: Story = {
  args: {
    debts: [
      { id: "d1", name: "Personal Loan", remaining_amount: 5000, interest_rate: 7.5, minimum_payment: 150, color: "#AF52DE" },
    ],
    totalMinimumPayment: 150,
    currency: "GBP",
  },
};
