import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DecisionRow } from "./DecisionRow";

const meta = {
  title: "Dense Data/DecisionRow",
  component: DecisionRow,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    amountTone: {
      control: "select",
      options: ["neutral", "positive", "negative", "warning"],
    },
  },
} satisfies Meta<typeof DecisionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Positive: Story = {
  args: {
    title: "Main Current Account",
    amount: "£4,250.75",
    amountTone: "positive",
    statusLabel: "Cash ready",
    interpretation:
      "Cash account available to cover near-term spending buffer.",
    meta: ["Current Account", "Private account", "8.5% of total exposure"],
  },
};

export const Negative: Story = {
  args: {
    title: "Amex Platinum",
    amount: "−£1,820.50",
    amountTone: "negative",
    statusLabel: "Liability watch",
    interpretation:
      "Outstanding card balance. Track utilisation and prioritise paydown.",
    meta: ["Credit Card", "Private account", "3.6% of total exposure"],
  },
};

export const Warning: Story = {
  args: {
    title: "Depleted Buffer",
    amount: "−£42.00",
    amountTone: "warning",
    statusLabel: "Low cash buffer",
    interpretation: "Cash balance is low. Protect essential payments first.",
    meta: ["Current Account", "Shared with 1 person", "0.1% of total exposure"],
  },
};

export const Neutral: Story = {
  args: {
    title: "Stocks & Shares ISA",
    amount: "£28,500.00",
    amountTone: "neutral",
    statusLabel: "Growth allocation",
    interpretation:
      "Long-term capital account. Review risk and diversification regularly.",
    meta: ["Investment", "Private account", "57.0% of total exposure"],
  },
};

export const MinimalMeta: Story = {
  name: "Minimal (no meta/interpretation)",
  args: {
    title: "Simple Row",
    amount: "£100.00",
    meta: [],
  },
};
