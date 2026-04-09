import { randomBytes } from "crypto";
import "@testing-library/jest-dom/vitest";

// Provide a deterministic encryption key for tests
process.env.ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || randomBytes(32).toString("hex");

// Enable mock auth so server helpers return deterministic values
process.env.MOCK_AUTH = "true";
process.env.NEXT_PUBLIC_MOCK_AUTH = "true";
