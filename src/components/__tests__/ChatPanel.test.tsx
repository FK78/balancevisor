// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatPanel } from "@/components/ChatPanel";

vi.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    messages: [],
    sendMessage: vi.fn(),
    setMessages: vi.fn(),
    status: "ready",
  }),
}));

vi.mock("posthog-js", () => ({
  default: {
    capture: vi.fn(),
  },
}));

vi.mock("@/lib/formatMarkdown", () => ({
  formatMarkdown: (value: string) => value,
}));

describe("ChatPanel", () => {
  it("uses the mobile full-height shell", async () => {
    const user = userEvent.setup();

    render(<ChatPanel />);

    await user.click(screen.getByRole("button", { name: /ai assistant/i }));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByPlaceholderText(/ask about your finances/i),
    ).toBeInTheDocument();
  });
});
