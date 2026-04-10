import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChartSkeleton } from "./ChartSkeleton";

const meta = {
  title: "Feedback/ChartSkeleton",
  component: ChartSkeleton,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ChartSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tall: Story = {
  args: { height: 500 },
};

export const Compact: Story = {
  args: { height: 180 },
};
