import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { InstallGuideDialog } from "./InstallGuideDialog";

const meta = {
  title: "Dialogs/InstallGuideDialog",
  component: InstallGuideDialog,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
} satisfies Meta<typeof InstallGuideDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const IosSafari: Story = {
  args: { open: true, onOpenChange: () => {}, method: "ios-safari" },
};

export const MacosSafari: Story = {
  args: { open: true, onOpenChange: () => {}, method: "macos-safari" },
};

export const AndroidBrowser: Story = {
  args: { open: true, onOpenChange: () => {}, method: "android-browser" },
};

export const Unsupported: Story = {
  args: { open: true, onOpenChange: () => {}, method: "unsupported" },
};
