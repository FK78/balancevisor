import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AccountQuickAdd } from "./AccountQuickAdd";

const meta = {
  title: "Onboarding/AccountQuickAdd",
  component: AccountQuickAdd,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccountQuickAdd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Fresh: Story = {
  args: {
    currency: "GBP",
    onAddAccount: () => {},
    existingAccounts: [],
  },
};

export const SomeAccountsExist: Story = {
  args: {
    currency: "GBP",
    onAddAccount: () => {},
    existingAccounts: [
      { id: "a1", accountName: "Main Account", type: "currentAccount", balance: 2400 },
      { id: "a2", accountName: "Savings", type: "savings", balance: 15000 },
    ],
  },
};
