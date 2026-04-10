// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormDialog } from "@/components/FormDialog";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("FormDialog", () => {
  const defaultProps = {
    entityName: "Account",
    isEdit: false,
    onSubmit: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders create trigger button by default", () => {
    render(
      <FormDialog {...defaultProps}>
        <input name="name" />
      </FormDialog>,
    );
    expect(screen.getByRole("button", { name: /add account/i })).toBeInTheDocument();
  });

  it("renders edit trigger button when isEdit is true", () => {
    render(
      <FormDialog {...defaultProps} isEdit>
        <input name="name" />
      </FormDialog>,
    );
    // Edit mode shows a pencil icon button
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("opens dialog on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <FormDialog {...defaultProps}>
        <input name="name" placeholder="Account name" />
      </FormDialog>,
    );

    await user.click(screen.getByRole("button", { name: /add account/i }));

    expect(screen.getByRole("heading", { name: "Add Account" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Account name")).toBeInTheDocument();
  });

  it("shows cancel and submit buttons in form view", async () => {
    const user = userEvent.setup();
    render(
      <FormDialog {...defaultProps}>
        <input name="name" />
      </FormDialog>,
    );

    await user.click(screen.getByRole("button", { name: /add account/i }));

    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add account/i })).toBeInTheDocument();
  });

  it("uses the mobile full-height form shell by default", async () => {
    const user = userEvent.setup();
    render(
      <FormDialog {...defaultProps}>
        <input name="name" />
      </FormDialog>,
    );

    await user.click(screen.getByRole("button", { name: /add account/i }));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /cancel/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });

  it("uses custom title when provided", async () => {
    const user = userEvent.setup();
    render(
      <FormDialog
        {...defaultProps}
        title={{ create: "New Bank Account", edit: "Edit Bank Account" }}
      >
        <input name="name" />
      </FormDialog>,
    );

    await user.click(screen.getAllByRole("button")[0]);

    expect(screen.getByRole("heading", { name: "New Bank Account" })).toBeInTheDocument();
  });

  it("uses custom submit label when provided", async () => {
    const user = userEvent.setup();
    render(
      <FormDialog
        {...defaultProps}
        submitLabel={{ create: "Create Account", edit: "Update Account" }}
      >
        <input name="name" />
      </FormDialog>,
    );

    await user.click(screen.getAllByRole("button", { name: /add account/i })[0]);

    expect(
      screen.getByRole("button", { name: /create account/i }),
    ).toBeInTheDocument();
  });
});
