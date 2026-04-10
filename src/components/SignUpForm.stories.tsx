import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SignUpForm } from "./SignUpForm";

const meta = {
  title: "Auth/SignUpForm",
  component: SignUpForm,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SignUpForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
