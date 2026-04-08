import { describe, it, expect, beforeAll, vi } from "vitest";
import { randomBytes } from "crypto";

// Mock the database module so encryption.ts doesn't try to connect
vi.mock("@/index", () => ({
  db: {},
}));

import {
  encrypt,
  decrypt,
  isEncrypted,
  encryptForUser,
  decryptForUser,
  needsReencryption,
  clearUserKeyCache,
} from "@/lib/encryption";

beforeAll(() => {
  clearUserKeyCache();
});

describe("Master key encryption", () => {
  it("encrypts and decrypts with master key", () => {
    const plaintext = "hello world";
    const encrypted = encrypt(plaintext);
    expect(decrypt(encrypted)).toBe(plaintext);
  });

  it("produces different ciphertexts for same plaintext (random IV)", () => {
    const encrypted1 = encrypt("same");
    const encrypted2 = encrypt("same");
    expect(encrypted1).not.toBe(encrypted2);
  });

  it("throws on invalid format", () => {
    expect(() => decrypt("invalid")).toThrow("Invalid encrypted value format");
  });

  it("returns empty string for empty/null input", () => {
    expect(decrypt("")).toBe("");
  });

  it("includes version prefix in encrypted output", () => {
    const encrypted = encrypt("test");
    expect(encrypted.startsWith("v1:")).toBe(true);
  });
});

describe("Per-user key encryption", () => {
  it("encrypts and decrypts with per-user key", () => {
    const userKey = randomBytes(32);
    const plaintext = "sensitive data";
    const encrypted = encryptForUser(plaintext, userKey);
    expect(decryptForUser(encrypted, userKey)).toBe(plaintext);
  });

  it("throws with wrong user key (auth tag mismatch)", () => {
    const userKey1 = randomBytes(32);
    const userKey2 = randomBytes(32);
    const encrypted = encryptForUser("secret", userKey1);
    expect(() => decryptForUser(encrypted, userKey2)).toThrow();
  });

  it("produces different ciphertexts for same plaintext with same key", () => {
    const userKey = randomBytes(32);
    const encrypted1 = encryptForUser("same", userKey);
    const encrypted2 = encryptForUser("same", userKey);
    expect(encrypted1).not.toBe(encrypted2);
  });

  it("encrypts empty string (produces empty ciphertext)", () => {
    const userKey = randomBytes(32);
    const encrypted = encryptForUser("", userKey);
    // Empty ciphertext fails isEncrypted() check, so decryptForUser returns as-is
    expect(encrypted).toMatch(/^v1:/);
  });

  it("handles unicode characters", () => {
    const userKey = randomBytes(32);
    const plaintext = "Hello 世界 🌍";
    const encrypted = encryptForUser(plaintext, userKey);
    expect(decryptForUser(encrypted, userKey)).toBe(plaintext);
  });

  it("includes version prefix in output", () => {
    const userKey = randomBytes(32);
    const encrypted = encryptForUser("test", userKey);
    expect(encrypted.startsWith("v1:")).toBe(true);
  });
});

describe("isEncrypted", () => {
  it("returns true for encrypted values (versioned)", () => {
    const encrypted = encrypt("test");
    expect(isEncrypted(encrypted)).toBe(true);
  });

  it("returns false for plaintext", () => {
    expect(isEncrypted("hello world")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isEncrypted("")).toBe(false);
  });

  it("returns true for legacy format (no version prefix)", () => {
    const iv = randomBytes(12).toString("hex");
    const tag = randomBytes(16).toString("hex");
    const ct = randomBytes(32).toString("hex");
    expect(isEncrypted(`${iv}:${tag}:${ct}`)).toBe(true);
  });

  it("returns true for versioned format", () => {
    const iv = randomBytes(12).toString("hex");
    const tag = randomBytes(16).toString("hex");
    const ct = randomBytes(32).toString("hex");
    expect(isEncrypted(`v1:${iv}:${tag}:${ct}`)).toBe(true);
  });
});

describe("needsReencryption", () => {
  it("returns false for current version", () => {
    const encrypted = encrypt("test");
    expect(needsReencryption(encrypted)).toBe(false);
  });

  it("returns false for legacy format (treated as v1)", () => {
    const iv = randomBytes(12).toString("hex");
    const tag = randomBytes(16).toString("hex");
    const ct = randomBytes(32).toString("hex");
    expect(needsReencryption(`${iv}:${tag}:${ct}`)).toBe(false);
  });
});

describe("clearUserKeyCache", () => {
  it("clears the cache without error", () => {
    expect(() => clearUserKeyCache()).not.toThrow();
  });
});
