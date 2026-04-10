import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { UpdatePasswordForm } from "./UpdatePasswordForm";

const meta = {
  title: "Auth/UpdatePasswordForm",
  component: UpdatePasswordForm,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof UpdatePasswordForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
