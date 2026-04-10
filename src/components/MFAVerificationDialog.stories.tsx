import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MFAVerificationDialog } from "./MFAVerificationDialog";

const meta = {
  title: "Auth/MFAVerificationDialog",
  component: MFAVerificationDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof MFAVerificationDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    factorId: "factor-123",
    email: "user@example.com",
    onSuccess: () => {},
  },
};
