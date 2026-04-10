import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AddHoldingDialog } from "./AddHoldingDialog";

const meta = {
  title: "Dialogs/AddHoldingDialog",
  component: AddHoldingDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof AddHoldingDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const investmentAccounts = [
  { id: "ia1", accountName: "ISA" },
  { id: "ia2", accountName: "General Investment" },
];

const groups = [
  { id: "g1", name: "Tech", color: "#007AFF", account_id: "ia1" },
  { id: "g2", name: "Dividend", color: "#34C759", account_id: null },
];

export const CreateMode: Story = {
  args: { investmentAccounts, groups },
};

export const EditMode: Story = {
  args: {
    investmentAccounts,
    groups,
    holding: {
      id: "h1",
      name: "Apple Inc",
      ticker: "AAPL",
      quantity: 10,
      average_price: 145,
      account_id: "ia1",
      group_id: "g1",
    },
  },
};
