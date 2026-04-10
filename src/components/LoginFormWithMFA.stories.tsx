import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LoginFormWithMFA } from "./LoginFormWithMFA";

const meta = {
  title: "Auth/LoginFormWithMFA",
  component: LoginFormWithMFA,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LoginFormWithMFA>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
