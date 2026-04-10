import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChangePasswordForm } from "./ChangePasswordForm";

const meta = {
  title: "Auth/ChangePasswordForm",
  component: ChangePasswordForm,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChangePasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { email: "user@example.com" },
};
