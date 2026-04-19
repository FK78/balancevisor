import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ConnectBrokerDialog } from "./ConnectBrokerDialog";

const meta = {
  title: "Dialogs/ConnectBrokerDialog",
  component: ConnectBrokerDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ConnectBrokerDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoBrokersConnected: Story = {
  args: {
    connectedBrokers: [],
    investmentAccounts: [
      { id: "ia1", accountName: "ISA" },
      { id: "ia2", accountName: "General Investment" },
    ],
  },
};

export const SomeConnected: Story = {
  args: {
    connectedBrokers: ["trading212", "coinbase"] as const,
    investmentAccounts: [{ id: "ia1", accountName: "ISA" }],
  },
};
