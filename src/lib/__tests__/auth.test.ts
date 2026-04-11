import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

describe("auth helpers", () => {
  const originalMockAuth = process.env.MOCK_AUTH;
  const originalPublicMockAuth = process.env.NEXT_PUBLIC_MOCK_AUTH;

  beforeEach(() => {
    vi.resetModules();
    mockGetUser.mockReset();
    delete process.env.MOCK_AUTH;
    delete process.env.NEXT_PUBLIC_MOCK_AUTH;
  });

  afterEach(() => {
    process.env.MOCK_AUTH = originalMockAuth;
    process.env.NEXT_PUBLIC_MOCK_AUTH = originalPublicMockAuth;
  });

  it("returns the seeded mock user id without calling Supabase when MOCK_AUTH is enabled", async () => {
    process.env.MOCK_AUTH = "true";
    process.env.NEXT_PUBLIC_MOCK_AUTH = "true";

    const { getCurrentUserId } = await import("@/lib/auth");

    await expect(getCurrentUserId()).resolves.toBe(
      "f02d2f39-74f1-4771-b70c-92d708a83890",
    );
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it("returns the mock email without calling Supabase when MOCK_AUTH is enabled", async () => {
    process.env.MOCK_AUTH = "true";
    process.env.NEXT_PUBLIC_MOCK_AUTH = "true";

    const { getCurrentUserEmail } = await import("@/lib/auth");

    await expect(getCurrentUserEmail()).resolves.toBe("dev@balancevisor.local");
    expect(mockGetUser).not.toHaveBeenCalled();
  });
});
