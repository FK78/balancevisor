import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReportsSavingsRate } from "./ReportsSavingsRate";
import { reportsDecorator } from "./reports-story-decorator";

const meta = {
  title: "Reports/SavingsRate",
  component: ReportsSavingsRate,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [reportsDecorator],
} satisfies Meta<typeof ReportsSavingsRate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
