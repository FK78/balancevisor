import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DebtPaymentDialog } from "./DebtPaymentDialog";

const meta = {
  title: "Dialogs/DebtPaymentDialog",
  component: DebtPaymentDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof DebtPaymentDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    debtId: "d-1",
    debtName: "Student Loan",
    remainingAmount: 12000,
    accounts: [
      { id: "a1", accountName: "Main Current" },
      { id: "a2", accountName: "Savings" },
    ] as any[],
  },
};
