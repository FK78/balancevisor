import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ShareSnapshotDialog } from "./ShareSnapshotDialog";

const meta = {
  title: "Dialogs/ShareSnapshotDialog",
  component: ShareSnapshotDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof ShareSnapshotDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    milestone: {
      kind: "net_worth_growth",
      title: "Net Worth +34%",
      subtitle: "Grew from £32k to £43k this year",
      stat: "+34%",
      detail: null,
      accent: "emerald",
      achievedAt: "2026-04-01",
    },
    displayName: "Fahad",
  },
};
