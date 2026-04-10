import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReportsKPIStats } from "./ReportsKPIStats";
import { reportsDecorator } from "./reports-story-decorator";

const meta = {
  title: "Reports/KPIStats",
  component: ReportsKPIStats,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [reportsDecorator],
} satisfies Meta<typeof ReportsKPIStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
