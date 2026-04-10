import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReportsNetSavingsTrend } from "./ReportsNetSavingsTrend";
import { reportsDecorator } from "./reports-story-decorator";

const meta = {
  title: "Reports/NetSavingsTrend",
  component: ReportsNetSavingsTrend,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [reportsDecorator],
} satisfies Meta<typeof ReportsNetSavingsTrend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
