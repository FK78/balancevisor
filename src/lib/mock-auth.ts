export interface MockAuthIdentity {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly fullName: string;
}

export const MOCK_AUTH_HEADER = "x-balancevisor-mock-auth";

const DEFAULT_MOCK_AUTH_IDENTITY: MockAuthIdentity = {
  id: "f02d2f39-74f1-4771-b70c-92d708a83890",
  email: "dev@balancevisor.local",
  displayName: "Dev User",
  fullName: "Dev User",
};

export function isMockAuthEnabled() {
  return process.env.MOCK_AUTH === "true" || process.env.NEXT_PUBLIC_MOCK_AUTH === "true";
}

export function hasMockAuthHeader(value: string | null | undefined) {
  return value === "true" || value === "1" || value === "mock";
}

export function getMockAuthIdentity(): MockAuthIdentity {
  const displayName =
    process.env.MOCK_AUTH_USER_DISPLAY_NAME ??
    process.env.NEXT_PUBLIC_MOCK_AUTH_USER_DISPLAY_NAME ??
    DEFAULT_MOCK_AUTH_IDENTITY.displayName;
  const fullName =
    process.env.MOCK_AUTH_USER_FULL_NAME ??
    process.env.NEXT_PUBLIC_MOCK_AUTH_USER_FULL_NAME ??
    displayName;

  return {
    id:
      process.env.MOCK_AUTH_USER_ID ??
      process.env.NEXT_PUBLIC_MOCK_AUTH_USER_ID ??
      DEFAULT_MOCK_AUTH_IDENTITY.id,
    email:
      process.env.MOCK_AUTH_USER_EMAIL ??
      process.env.NEXT_PUBLIC_MOCK_AUTH_USER_EMAIL ??
      DEFAULT_MOCK_AUTH_IDENTITY.email,
    displayName,
    fullName,
  };
}
