import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReviewFlagCard } from "./ReviewFlagCard";

const meta = {
  title: "Cards/ReviewFlagCard",
  component: ReviewFlagCard,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReviewFlagCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PossibleSubscription: Story = {
  args: {
    flag: {
      id: "f1",
      flag_type: "possible_subscription",
      transaction_id: "t1",
      amount: 15.99,
      description: "Netflix",
      subscriptionName: "Netflix Premium",
      debtName: null,
      subscription_id: "s1",
      debt_id: null,
      created_at: "2026-04-01",
    } as any,
    currency: "GBP",
    onResolved: () => {},
  },
};

export const PossibleDebtPayment: Story = {
  args: {
    flag: {
      id: "f2",
      flag_type: "possible_debt_payment",
      transaction_id: "t2",
      amount: 250,
      description: "Student Loan Co",
      subscriptionName: null,
      debtName: "Student Loan",
      subscription_id: null,
      debt_id: "d1",
      created_at: "2026-04-01",
    } as any,
    currency: "GBP",
    onResolved: () => {},
  },
};
