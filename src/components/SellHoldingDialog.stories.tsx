import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SellHoldingDialog } from "./SellHoldingDialog";

const meta = {
  title: "Dialogs/SellHoldingDialog",
  component: SellHoldingDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof SellHoldingDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    holding: {
      id: "h1",
      name: "Apple Inc",
      ticker: "AAPL",
      quantity: 10,
      average_price: 145,
      current_price: 178,
      currency: "GBP",
    },
    investmentAccounts: [
      { id: "ia1", accountName: "ISA" },
      { id: "ia2", accountName: "General Investment" },
    ],
  },
};
