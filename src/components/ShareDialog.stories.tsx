import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ShareDialog } from "./ShareDialog";

const meta = {
  title: "Dialogs/ShareDialog",
  component: ShareDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ShareDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoShares: Story = {
  args: {
    resourceType: "account",
    resourceId: "a1",
    resourceName: "Main Current Account",
    existingShares: [],
  },
};

export const WithExistingShares: Story = {
  args: {
    resourceType: "budget",
    resourceId: "b1",
    resourceName: "Groceries Budget",
    existingShares: [
      { id: "s1", email: "partner@example.com", permission: "read", status: "accepted" },
      { id: "s2", email: "accountant@example.com", permission: "write", status: "pending" },
    ] as any[],
  },
};
