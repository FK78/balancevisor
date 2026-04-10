import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InvestmentGroupDialog } from "./InvestmentGroupDialog";

const meta = {
  title: "Dialogs/InvestmentGroupDialog",
  component: InvestmentGroupDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof InvestmentGroupDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const investmentAccounts = [
  { id: "ia1", accountName: "ISA" },
  { id: "ia2", accountName: "General Investment" },
];

export const CreateMode: Story = {
  args: { investmentAccounts },
};

export const EditMode: Story = {
  args: {
    investmentAccounts,
    group: {
      id: "g1",
      name: "Tech Growth",
      color: "#007AFF",
      account_id: "ia1",
    },
  },
};
