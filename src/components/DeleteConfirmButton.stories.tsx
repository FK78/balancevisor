import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DeleteConfirmButton } from "./DeleteConfirmButton";

const meta = {
  title: "Buttons/DeleteConfirmButton",
  component: DeleteConfirmButton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof DeleteConfirmButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onDelete: async () => {},
    entityName: "Account",
    dialogTitle: "Delete Account?",
    dialogDescription: "This action cannot be undone. All transactions in this account will be deleted.",
    successTitle: "Account deleted",
    successDescription: "The account and all its data have been removed.",
  },
};
