// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const { captureException } = vi.hoisted(() => ({
  captureException: vi.fn(),
}));

vi.mock("posthog-js", () => ({
  default: {
    captureException,
  },
}));

// Suppress console.error from ErrorBoundary.componentDidCatch
beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  captureException.mockReset();
});

function ThrowingChild({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>Child content</div>;
}

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <div>OK content</div>
      </ErrorBoundary>,
    );
    expect(screen.getByText("OK content")).toBeInTheDocument();
  });

  it("renders default fallback UI when child throws", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("renders custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Custom fallback")).toBeInTheDocument();
  });

  it("recovers after clicking Try again", async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    function ConditionalChild() {
      if (shouldThrow) throw new Error("Boom");
      return <div>Recovered content</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Fix the child before clicking retry
    shouldThrow = false;

    await user.click(screen.getByRole("button", { name: /try again/i }));

    // Re-render to pick up the state change
    rerender(
      <ErrorBoundary>
        <ConditionalChild />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Recovered content")).toBeInTheDocument();
  });

  it("logs error to console", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(console.error).toHaveBeenCalled();
  });

  it("captures boundary errors in PostHog", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        source: "error_boundary",
        componentStack: expect.any(String),
      }),
    );
  });
});
