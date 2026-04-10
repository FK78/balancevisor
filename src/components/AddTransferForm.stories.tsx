import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TransferFormDialog } from "./AddTransferForm";

const meta = {
  title: "Forms/TransferFormDialog",
  component: TransferFormDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof TransferFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    accounts: [
      { id: "a1", accountName: "Main Current" },
      { id: "a2", accountName: "Savings" },
      { id: "a3", accountName: "Credit Card" },
    ] as any[],
  },
};
