import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReportsCategoryPie } from "./ReportsCategoryPie";
import { reportsDecorator } from "./reports-story-decorator";

const meta = {
  title: "Reports/CategoryPie",
  component: ReportsCategoryPie,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  decorators: [reportsDecorator],
} satisfies Meta<typeof ReportsCategoryPie>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
