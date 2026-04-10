import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ErrorBoundary } from "./ErrorBoundary";

const meta = {
  title: "Utilities/ErrorBoundary",
  component: ErrorBoundary,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

function BrokenChild(): React.ReactNode {
  throw new Error("Test error for Storybook");
}

export const WithError: Story = {
  args: {
    children: <BrokenChild />,
  },
};

export const Healthy: Story = {
  args: {
    children: <p className="text-sm">Everything is fine here.</p>,
  },
};
