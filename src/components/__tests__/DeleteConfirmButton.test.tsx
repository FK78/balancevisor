// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteConfirmButton } from "@/components/DeleteConfirmButton";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("DeleteConfirmButton", () => {
  const defaultProps = {
    onDelete: vi.fn().mockResolvedValue(undefined),
    dialogTitle: "Delete item?",
    dialogDescription: "This action cannot be undone.",
    successTitle: "Item deleted",
    successDescription: "The item has been removed.",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the trigger button", () => {
    render(<DeleteConfirmButton {...defaultProps} />);
    const btn = screen.getByRole("button", { name: /delete item/i });
    expect(btn).toBeInTheDocument();
  });

  it("opens dialog when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<DeleteConfirmButton {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /delete item/i }));

    expect(screen.getByText("Delete item?")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("uses the mobile full-height alert shell", async () => {
    const user = userEvent.setup();
    render(<DeleteConfirmButton {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /delete item/i }));

    expect(screen.getByRole("alertdialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /cancel/i }).closest("[data-slot='alert-dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });

  it("calls onDelete and shows success toast when Delete is clicked", async () => {
    const user = userEvent.setup();
    render(<DeleteConfirmButton {...defaultProps} />);

    // Open dialog
    await user.click(screen.getByRole("button", { name: /delete item/i }));

    // Click delete
    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(defaultProps.onDelete).toHaveBeenCalledOnce();
  });

  it("shows error toast when onDelete fails", async () => {
    const user = userEvent.setup();
    const failingProps = {
      ...defaultProps,
      onDelete: vi.fn().mockRejectedValue(new Error("fail")),
    };

    render(<DeleteConfirmButton {...failingProps} />);

    await user.click(screen.getByRole("button", { name: /delete item/i }));
    await user.click(screen.getByRole("button", { name: /delete/i }));

    // Wait for the error toast
    expect(failingProps.onDelete).toHaveBeenCalledOnce();
  });

  it("closes dialog when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<DeleteConfirmButton {...defaultProps} />);

    // Open dialog
    await user.click(screen.getByRole("button", { name: /delete item/i }));
    expect(screen.getByText("Delete item?")).toBeInTheDocument();

    // Click cancel
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    // Dialog should close — title should no longer be visible
    expect(screen.queryByText("Delete item?")).not.toBeInTheDocument();
  });
});
