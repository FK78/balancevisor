import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PendingInvitations } from "./PendingInvitations";

const meta = {
  title: "Data Display/PendingInvitations",
  component: PendingInvitations,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PendingInvitations>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithInvitations: Story = {
  args: {
    invitations: [
      {
        id: "i1",
        resource_type: "account",
        resourceName: "Family Current Account",
        permission: "view",
        shared_with_email: "partner@example.com",
      },
      {
        id: "i2",
        resource_type: "budget",
        resourceName: "Groceries Budget",
        permission: "edit",
        shared_with_email: "partner@example.com",
      },
    ],
  },
};

export const Empty: Story = {
  args: { invitations: [] },
};
