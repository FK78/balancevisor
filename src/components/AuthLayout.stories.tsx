import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthLayout } from "./AuthLayout";

const meta = {
  title: "Layout/AuthLayout",
  component: AuthLayout,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AuthLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
        Form content goes here
      </div>
    ),
  },
};
