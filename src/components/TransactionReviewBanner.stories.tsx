import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TransactionReviewBanner } from "./TransactionReviewBanner";

const meta = {
  title: "Banners/TransactionReviewBanner",
  component: TransactionReviewBanner,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TransactionReviewBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MultipleFlags: Story = {
  args: {
    flags: [
      { id: "f1", flag_type: "possible_subscription", transaction_id: "t1", amount: 15.99 },
      { id: "f2", flag_type: "subscription_amount_mismatch", transaction_id: "t2", amount: 9.99 },
      { id: "f3", flag_type: "possible_debt_payment", transaction_id: "t3", amount: 250 },
    ] as any[],
    currency: "GBP",
  },
};

export const SingleFlag: Story = {
  args: {
    flags: [
      { id: "f1", flag_type: "possible_subscription", transaction_id: "t1", amount: 12.99 },
    ] as any[],
    currency: "GBP",
  },
};

export const Empty: Story = {
  args: {
    flags: [],
    currency: "GBP",
  },
};
