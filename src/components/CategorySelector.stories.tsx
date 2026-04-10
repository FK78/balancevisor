import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CategorySelector } from "./CategorySelector";

const meta = {
  title: "Onboarding/CategorySelector",
  component: CategorySelector,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[500px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CategorySelector>;

export default meta;
type Story = StoryObj<typeof meta>;

const templates = [
  { id: "t1", name: "Groceries", color: "#34C759", icon: null },
  { id: "t2", name: "Transport", color: "#007AFF", icon: null },
  { id: "t3", name: "Entertainment", color: "#AF52DE", icon: null },
  { id: "t4", name: "Eating Out", color: "#FF9500", icon: null },
  { id: "t5", name: "Shopping", color: "#FF2D55", icon: null },
];

export const Fresh: Story = {
  args: {
    templates,
    existingCategories: [],
    onAddDefaults: () => {},
    canAddDefaults: true,
  },
};

export const SomeExist: Story = {
  args: {
    templates,
    existingCategories: [
      { id: "c1", name: "Groceries", color: "#34C759" },
      { id: "c2", name: "Transport", color: "#007AFF" },
    ],
    onAddDefaults: () => {},
    canAddDefaults: true,
  },
};
