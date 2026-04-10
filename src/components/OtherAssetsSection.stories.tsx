import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { OtherAssetsSection } from "./OtherAssetsSection";

const meta = {
  title: "Sections/OtherAssetsSection",
  component: OtherAssetsSection,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OtherAssetsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    baseCurrency: "GBP",
    assets: [
      { id: "oa1", name: "Gold Bar", asset_type: "gold", value: 5200, weight_grams: 100, is_zakatable: true, notes: null },
      { id: "oa2", name: "Silver Coins", asset_type: "silver", value: 800, weight_grams: 500, is_zakatable: true, notes: null },
      { id: "oa3", name: "Buy-to-Let Flat", asset_type: "property", value: 250000, weight_grams: null, is_zakatable: false, notes: "Zone 3 rental" },
      { id: "oa4", name: "Company Pension", asset_type: "pension", value: 42000, weight_grams: null, is_zakatable: false, notes: null },
    ],
  },
};

export const Empty: Story = {
  args: { baseCurrency: "GBP", assets: [] },
};
