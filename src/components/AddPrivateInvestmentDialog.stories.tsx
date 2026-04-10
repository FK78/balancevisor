import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AddPrivateInvestmentDialog } from "./AddPrivateInvestmentDialog";

const meta = {
  title: "Dialogs/AddPrivateInvestmentDialog",
  component: AddPrivateInvestmentDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof AddPrivateInvestmentDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const investmentAccounts = [
  { id: "ia1", accountName: "ISA" },
  { id: "ia2", accountName: "General Investment" },
];

const groups = [
  { id: "g1", name: "Property", color: "#FF9500", account_id: null },
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
      name: "London Flat",
      quantity: 1,
      average_price: 350000,
      investment_type: "real_estate",
      estimated_return_percent: 5.2,
      notes: "2-bed flat in Zone 2",
      account_id: null,
      group_id: "g1",
    },
  },
};
