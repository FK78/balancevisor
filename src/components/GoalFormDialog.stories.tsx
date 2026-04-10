import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GoalFormDialog } from "./GoalFormDialog";

const meta = {
  title: "Forms/GoalFormDialog",
  component: GoalFormDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof GoalFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateMode: Story = {
  args: {},
};

export const EditMode: Story = {
  args: {
    goal: {
      id: "g-1",
      name: "Holiday Fund",
      target_amount: 3000,
      saved_amount: 1200,
      color: "#007AFF",
    } as any,
  },
};
