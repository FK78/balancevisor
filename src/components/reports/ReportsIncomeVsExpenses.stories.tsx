import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReportsIncomeVsExpenses } from "./ReportsIncomeVsExpenses";
import { reportsDecorator } from "./reports-story-decorator";

const meta = {
  title: "Reports/IncomeVsExpenses",
  component: ReportsIncomeVsExpenses,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [reportsDecorator],
} satisfies Meta<typeof ReportsIncomeVsExpenses>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
