import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDialog } from "./FormDialog";

const meta = {
  title: "Overlays/FormDialog",
  component: FormDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    onSubmit: fn(async () => {}),
  },
} satisfies Meta<typeof FormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateMode: Story = {
  args: {
    entityName: "Budget",
    isEdit: false,
    description: {
      create: "Set a spending limit for a category.",
      edit: "Update the budget details.",
    },
    children: (
      <>
        <div className="grid gap-2">
          <Label htmlFor="name">Category Name</Label>
          <Input id="name" name="name" placeholder="e.g. Groceries" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="amount">Budget Amount</Label>
          <Input id="amount" name="amount" type="number" placeholder="0.00" required />
        </div>
      </>
    ),
  },
};

export const EditMode: Story = {
  args: {
    entityName: "Budget",
    isEdit: true,
    description: {
      create: "Set a spending limit for a category.",
      edit: "Update the budget details.",
    },
    children: (
      <>
        <div className="grid gap-2">
          <Label htmlFor="name">Category Name</Label>
          <Input id="name" name="name" defaultValue="Groceries" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="amount">Budget Amount</Label>
          <Input id="amount" name="amount" type="number" defaultValue="350" required />
        </div>
      </>
    ),
  },
};

export const CustomEntity: Story = {
  name: "Custom Entity (Goal)",
  args: {
    entityName: "Goal",
    isEdit: false,
    children: (
      <>
        <div className="grid gap-2">
          <Label htmlFor="goal-name">Goal Name</Label>
          <Input id="goal-name" name="name" placeholder="e.g. Holiday Fund" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="target">Target Amount</Label>
          <Input id="target" name="target" type="number" placeholder="5000" required />
        </div>
      </>
    ),
  },
};
