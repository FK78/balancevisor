import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ContributeGoalDialog } from "./ContributeGoalDialog";

const meta = {
  title: "Dialogs/ContributeGoalDialog",
  component: ContributeGoalDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ContributeGoalDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    goalId: "g-1",
    goalName: "Holiday Fund",
  },
};
