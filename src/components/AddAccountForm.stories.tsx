import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AccountFormDialog } from "./AddAccountForm";

const meta = {
  title: "Forms/AccountFormDialog",
  component: AccountFormDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof AccountFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateMode: Story = {
  args: {},
};

export const EditMode: Story = {
  args: {
    account: {
      id: "acc-1",
      accountName: "Main Current Account",
      type: "currentAccount",
      balance: 4250,
    },
  },
};
