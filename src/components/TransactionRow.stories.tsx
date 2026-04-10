import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TransactionRow } from "./TransactionRow";
import { Table, TableBody } from "./ui/table";

const meta = {
  title: "Data Display/TransactionRow",
  component: TransactionRow,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Table>
          <TableBody>
            <Story />
          </TableBody>
        </Table>
      </div>
    ),
  ],
} satisfies Meta<typeof TransactionRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expense: Story = {
  args: {
    t: { id: "t1", description: "Tesco Express", category: "Groceries", date: "2026-04-08", amount: 42.5, type: "expense" },
    currency: "GBP",
  },
};

export const Income: Story = {
  args: {
    t: { id: "t2", description: "Salary", category: "Income", date: "2026-04-01", amount: 3200, type: "income" },
    currency: "GBP",
  },
};

export const Transfer: Story = {
  args: {
    t: { id: "t3", description: "To Savings", category: null, date: "2026-04-05", amount: 500, type: "transfer" },
    currency: "GBP",
  },
};

export const Refund: Story = {
  args: {
    t: { id: "t4", description: "Amazon Refund", category: "Shopping", date: "2026-04-07", amount: 29.99, type: "refund" },
    currency: "GBP",
  },
};
