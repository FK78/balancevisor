/**
 * Tests for encryption functions.
 * Run with: npx tsx src/lib/encryption.test.ts
 */

import { randomBytes } from "crypto";

// Set test encryption key before importing encryption module
process.env.ENCRYPTION_KEY = randomBytes(32).toString("hex");

import {
  encrypt,
  decrypt,
  isEncrypted,
  encryptForUser,
  decryptForUser,
  needsReencryption,
  clearUserKeyCache,
} from "./encryption";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function assertThrows(fn: () => void, message: string) {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error(`Expected function to throw but it didn't: ${message}`);
  }
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void) {
    try {
      fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err}`);
      failed++;
    }
  }

  async function testAsync(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err}`);
      failed++;
    }
  }

  clearUserKeyCache();

  console.log("\nMaster key encryption:");

  test("encrypts and decrypts with master key", () => {
    const plaintext = "hello world";
    const encrypted = encrypt(plaintext);
    assert(decrypt(encrypted) === plaintext, "Decrypted value should match plaintext");
  });

  test("produces different ciphertexts for same plaintext (random IV)", () => {
    const encrypted1 = encrypt("same");
    const encrypted2 = encrypt("same");
    assert(encrypted1 !== encrypted2, "Ciphertexts should differ due to random IV");
  });

  test("returns empty string on invalid format", () => {
    const result = decrypt("invalid");
    assert(result === '', "Should return empty string for invalid format");
  });

  test("includes version prefix in encrypted output", () => {
    const encrypted = encrypt("test");
    assert(encrypted.startsWith("v1:"), "Should start with v1:");
  });

  console.log("\nPer-user key encryption:");

  test("encrypts and decrypts with per-user key", () => {
    const userKey = randomBytes(32);
    const plaintext = "sensitive data";
    const encrypted = encryptForUser(plaintext, userKey);
    assert(decryptForUser(encrypted, userKey) === plaintext, "Decrypted value should match");
  });

  test("returns empty string with wrong user key", () => {
    const userKey1 = randomBytes(32);
    const userKey2 = randomBytes(32);
    const plaintext = "secret";
    const encrypted = encryptForUser(plaintext, userKey1);
    const result = decryptForUser(encrypted, userKey2);
    assert(result === '', "Should return empty string with wrong key");
  });

  test("produces different ciphertexts for same plaintext with same key", () => {
    const userKey = randomBytes(32);
    const encrypted1 = encryptForUser("same", userKey);
    const encrypted2 = encryptForUser("same", userKey);
    assert(encrypted1 !== encrypted2, "Ciphertexts should differ due to random IV");
  });

  test("handles empty string", () => {
    const userKey = randomBytes(32);
    const encrypted = encryptForUser("", userKey);
    assert(decryptForUser(encrypted, userKey) === "", "Should handle empty string");
  });

  test("handles unicode characters", () => {
    const userKey = randomBytes(32);
    const plaintext = "Hello 世界 🌍";
    const encrypted = encryptForUser(plaintext, userKey);
    assert(decryptForUser(encrypted, userKey) === plaintext, "Should handle unicode");
  });

  test("includes version prefix in output", () => {
    const userKey = randomBytes(32);
    const encrypted = encryptForUser("test", userKey);
    assert(encrypted.startsWith("v1:"), "Should start with v1:");
  });

  console.log("\nisEncrypted:");

  test("returns true for encrypted values (versioned)", () => {
    const encrypted = encrypt("test");
    assert(isEncrypted(encrypted) === true, "Should detect versioned format");
  });

  test("returns false for plaintext", () => {
    assert(isEncrypted("hello world") === false, "Should return false for plaintext");
  });

  test("returns false for empty string", () => {
    assert(isEncrypted("") === false, "Should return false for empty string");
  });

  test("returns true for legacy format (no version prefix)", () => {
    const iv = randomBytes(12).toString("hex");
    const tag = randomBytes(16).toString("hex");
    const ct = randomBytes(32).toString("hex");
    const legacy = `${iv}:${tag}:${ct}`;
    assert(isEncrypted(legacy) === true, "Should detect legacy format");
  });

  test("returns true for versioned format", () => {
    const iv = randomBytes(12).toString("hex");
    const tag = randomBytes(16).toString("hex");
    const ct = randomBytes(32).toString("hex");
    const versioned = `v1:${iv}:${tag}:${ct}`;
    assert(isEncrypted(versioned) === true, "Should detect versioned format");
  });

  console.log("\nneedsReencryption:");

  test("returns false for current version", () => {
    const encrypted = encrypt("test");
    assert(needsReencryption(encrypted) === false, "Current version should not need re-encryption");
  });

  test("returns false for legacy format (treated as v1)", () => {
    const iv = randomBytes(12).toString("hex");
    const tag = randomBytes(16).toString("hex");
    const ct = randomBytes(32).toString("hex");
    const legacy = `${iv}:${tag}:${ct}`;
    assert(needsReencryption(legacy) === false, "Legacy is treated as v1 (current)");
  });

  console.log("\nclearUserKeyCache:");

  test("clears the cache without error", () => {
    clearUserKeyCache();
    assert(true, "Should not throw");
  });

  console.log(`\n${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test suite failed:", err);
  process.exit(1);
});
