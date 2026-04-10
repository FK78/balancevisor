import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReportsMonthlyCategoryBreakdown } from "./ReportsMonthlyCategoryBreakdown";
import { reportsDecorator } from "./reports-story-decorator";

const meta = {
  title: "Reports/MonthlyCategoryBreakdown",
  component: ReportsMonthlyCategoryBreakdown,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [reportsDecorator],
} satisfies Meta<typeof ReportsMonthlyCategoryBreakdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
