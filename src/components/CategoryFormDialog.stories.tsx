import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CategoryFormDialog } from "./CategoryFormDialog";

const meta = {
  title: "Forms/CategoryFormDialog",
  component: CategoryFormDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof CategoryFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateMode: Story = {
  args: {},
};

export const EditMode: Story = {
  args: {
    category: {
      id: "cat-1",
      name: "Groceries",
      color: "#4CAF50",
      icon: "shopping-cart",
    },
  },
};
