import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReportsMoneyFlow } from "./ReportsMoneyFlow";
import { reportsDecorator } from "./reports-story-decorator";

const meta = {
  title: "Reports/MoneyFlow",
  component: ReportsMoneyFlow,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [reportsDecorator],
} satisfies Meta<typeof ReportsMoneyFlow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
