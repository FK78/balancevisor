import { describe, it, expect, vi, afterEach } from "vitest";
import { formatTimeAgo } from "@/lib/formatTimeAgo";

describe("formatTimeAgo", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for < 60 seconds', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:30Z"));

    expect(formatTimeAgo(new Date("2025-06-15T12:00:00Z"))).toBe("just now");
  });

  it('returns "1 minute ago" for 60 seconds', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:01:00Z"));

    expect(formatTimeAgo(new Date("2025-06-15T12:00:00Z"))).toBe(
      "1 minute ago",
    );
  });

  it('returns "5 minutes ago"', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:05:00Z"));

    expect(formatTimeAgo(new Date("2025-06-15T12:00:00Z"))).toBe(
      "5 minutes ago",
    );
  });

  it('returns "1 hour ago"', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T13:00:00Z"));

    expect(formatTimeAgo(new Date("2025-06-15T12:00:00Z"))).toBe(
      "1 hour ago",
    );
  });

  it('returns "3 hours ago"', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T15:00:00Z"));

    expect(formatTimeAgo(new Date("2025-06-15T12:00:00Z"))).toBe(
      "3 hours ago",
    );
  });

  it('returns "1 day ago"', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-16T12:00:00Z"));

    expect(formatTimeAgo(new Date("2025-06-15T12:00:00Z"))).toBe("1 day ago");
  });

  it('returns "7 days ago"', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-22T12:00:00Z"));

    expect(formatTimeAgo(new Date("2025-06-15T12:00:00Z"))).toBe(
      "7 days ago",
    );
  });

  it('returns "1 month ago" for 30+ days', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-07-16T12:00:00Z"));

    expect(formatTimeAgo(new Date("2025-06-15T12:00:00Z"))).toBe(
      "1 month ago",
    );
  });

  it("pluralises months correctly", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-09-15T12:00:00Z"));

    expect(formatTimeAgo(new Date("2025-06-15T12:00:00Z"))).toBe(
      "3 months ago",
    );
  });
});
