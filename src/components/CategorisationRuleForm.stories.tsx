import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CategorisationRuleFormDialog } from "./CategorisationRuleForm";

const meta = {
  title: "Forms/CategorisationRuleFormDialog",
  component: CategorisationRuleFormDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof CategorisationRuleFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockCategories = [
  { id: "c1", name: "Groceries", color: "#34C759", icon: null, user_id: "u1" },
  { id: "c2", name: "Transport", color: "#007AFF", icon: null, user_id: "u1" },
  { id: "c3", name: "Entertainment", color: "#AF52DE", icon: null, user_id: "u1" },
] as any[];

export const CreateMode: Story = {
  args: { categories: mockCategories },
};

export const EditMode: Story = {
  args: {
    categories: mockCategories,
    rule: {
      id: "r1",
      pattern: "tesco",
      category_id: "c1",
      priority: 10,
    },
  },
};
