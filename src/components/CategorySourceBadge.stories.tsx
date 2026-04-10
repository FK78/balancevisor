import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CategorySourceBadge } from "./CategorySourceBadge";

const meta = {
  title: "Badges/CategorySourceBadge",
  component: CategorySourceBadge,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof CategorySourceBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rule: Story = { args: { source: "rule" } };
export const Merchant: Story = { args: { source: "merchant" } };
export const Bank: Story = { args: { source: "bank" } };
export const AI: Story = { args: { source: "ai" } };
export const Manual: Story = { args: { source: "manual" } };
export const Null: Story = { args: { source: null } };
