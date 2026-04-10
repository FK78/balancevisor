import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OtherAssetFormDialog } from "./OtherAssetFormDialog";

const meta = {
  title: "Forms/OtherAssetFormDialog",
  component: OtherAssetFormDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof OtherAssetFormDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CreateMode: Story = {
  args: {},
};

export const EditGold: Story = {
  args: {
    asset: {
      id: "oa1",
      name: "Gold Bar",
      asset_type: "gold",
      value: 5200,
      weight_grams: 100,
      is_zakatable: true,
      notes: "Purchased 2024",
    },
  },
};

export const EditCash: Story = {
  args: {
    asset: {
      id: "oa2",
      name: "Cash Savings",
      asset_type: "cash",
      value: 2000,
      weight_grams: null,
      is_zakatable: true,
      notes: null,
    },
  },
};
