import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DebtFormDialog } from "./DebtFormDialog";

const meta = {
  title: "Forms/DebtFormDialog",
  component: DebtFormDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof DebtFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateMode: Story = {
  args: {},
};

export const EditMode: Story = {
  args: {
    debt: {
      id: "d-1",
      name: "Student Loan",
      original_amount: 25000,
      remaining_amount: 12000,
      minimum_payment: 250,
      interest_rate: "4.5",
      color: "#007AFF",
    } as any,
  },
};
