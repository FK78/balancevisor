import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AccountCharts } from "./AccountCharts";

const meta = {
  title: "Charts/AccountCharts",
  component: AccountCharts,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[700px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccountCharts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    currency: "GBP",
    accounts: [
      { id: "a1", accountName: "Main Current", type: "currentAccount", balance: 2450 },
      { id: "a2", accountName: "Easy Saver", type: "savings", balance: 15200 },
      { id: "a3", accountName: "Barclaycard", type: "creditCard", balance: -1800 },
      { id: "a4", accountName: "S&S ISA", type: "investment", balance: 22000 },
    ],
  },
};
