import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { LRUCache } from "lru-cache";
import { eq } from "drizzle-orm";
import { userKeysTable } from "@/db/schema";
import { db } from "@/index";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

// Current key version for new encryptions
const CURRENT_KEY_VERSION = "v1";

// In-memory cache for decrypted user keys (TTL: 5 minutes)
const userKeyCache = new LRUCache<string, Buffer>({
  max: 10000,
  ttl: 5 * 60 * 1000,
});

// Cache for master keys by version (supports key rotation)
const masterKeyCache = new LRUCache<string, Buffer>({
  max: 10,
  ttl: 60 * 60 * 1000,
});

// ---------------------------------------------------------------------------
// Master key management (version-aware)
// ---------------------------------------------------------------------------

function getMasterKey(version: string = CURRENT_KEY_VERSION): Buffer {
  const cached = masterKeyCache.get(version);
  if (cached) return cached;

  const envVar = version === "v1"
    ? "ENCRYPTION_KEY"
    : `ENCRYPTION_KEY_${version.toUpperCase()}`;

  const hex = process.env[envVar];
  if (!hex) {
    throw new Error(`${envVar} env var is not set.`);
  }
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) {
    throw new Error(`${envVar} must be exactly 32 bytes (64 hex characters).`);
  }
  masterKeyCache.set(version, key);
  return key;
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

/**
 * Parse an encrypted value, extracting version, IV, auth tag, and ciphertext.
 * Handles both legacy format (iv:tag:ct) and versioned format (v1:iv:tag:ct).
 */
function parseEncrypted(encrypted: string): {
  version: string;
  iv: Buffer;
  authTag: Buffer;
  ciphertext: Buffer;
} {
  const parts = encrypted.split(":");

  let version: string;
  let dataParts: string[];

  if (parts[0].match(/^v\d+$/)) {
    version = parts[0];
    dataParts = parts.slice(1);
  } else {
    version = "v1";
    dataParts = parts;
  }

  if (dataParts.length !== 3) {
    throw new Error("Invalid encrypted value format. Expected [v1:]iv:authTag:ciphertext.");
  }

  const [ivHex, authTagHex, ciphertextHex] = dataParts;
  return {
    version,
    iv: Buffer.from(ivHex, "hex"),
    authTag: Buffer.from(authTagHex, "hex"),
    ciphertext: Buffer.from(ciphertextHex, "hex"),
  };
}

// ---------------------------------------------------------------------------
// Core encrypt/decrypt (master key, version-aware)
// ---------------------------------------------------------------------------

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns: `v1:iv:authTag:ciphertext` (all hex-encoded).
 */
export function encrypt(plaintext: string): string {
  const key = getMasterKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [
    CURRENT_KEY_VERSION,
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

/**
 * Decrypts a string produced by `encrypt()`.
 * Handles both versioned (v1:iv:tag:ct) and legacy (iv:tag:ct) formats.
 */
export function decrypt(encrypted: string): string {
  // Handle empty or null encrypted values
  if (!encrypted || encrypted.trim() === '') {
    return '';
  }

  try {
    const { version, iv, authTag, ciphertext } = parseEncrypted(encrypted);
    const key = getMasterKey(version);
    const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString("utf8");
  } catch (err) {
    console.warn("[encryption] decrypt (master key) failed — data may be corrupt or key mismatch:", err instanceof Error ? err.message : String(err));
    throw err;
  }
}

/**
 * Checks whether a string looks like it was produced by `encrypt()`.
 * Supports both versioned and legacy formats.
 */
export function isEncrypted(value: string): boolean {
  const parts = value.split(":");

  // Check for version prefix
  let dataParts: string[];
  if (parts[0].match(/^v\d+$/)) {
    dataParts = parts.slice(1);
  } else {
    dataParts = parts;
  }

  if (dataParts.length !== 3) return false;
  const [iv, tag, ct] = dataParts;
  return (
    iv.length === IV_LENGTH * 2 &&
    tag.length === AUTH_TAG_LENGTH * 2 &&
    ct.length > 0 &&
    /^[0-9a-f]+$/.test(iv) &&
    /^[0-9a-f]+$/.test(tag) &&
    /^[0-9a-f]+$/.test(ct)
  );
}

// ---------------------------------------------------------------------------
// Per-user envelope encryption
// ---------------------------------------------------------------------------

/**
 * Get or create a per-user encryption key.
 * Returns the plaintext key (cached in memory).
 */
export async function getUserKey(userId: string): Promise<Buffer> {
  const cached = userKeyCache.get(userId);
  if (cached) return cached;

  const [row] = await db
    .select({
      encrypted_key: userKeysTable.encrypted_key,
      key_version: userKeysTable.key_version,
    })
    .from(userKeysTable)
    .where(eq(userKeysTable.user_id, userId));

  if (!row) {
    // Lazily create the key if it doesn't exist yet (e.g. user is mid-onboarding)
    await createUserKey(userId);
    const cached2 = userKeyCache.get(userId);
    if (cached2) return cached2;

    // Fallback: re-read from DB in case cache wasn't populated
    const [retryRow] = await db
      .select({ encrypted_key: userKeysTable.encrypted_key })
      .from(userKeysTable)
      .where(eq(userKeysTable.user_id, userId));
    if (retryRow) {
      const retryKeyHex = decrypt(retryRow.encrypted_key);
      const retryKey = Buffer.from(retryKeyHex, "hex");
      userKeyCache.set(userId, retryKey);
      return retryKey;
    }

    throw new Error(`No encryption key found for user ${userId}. Call createUserKey() first.`);
  }

  const userKeyHex = decrypt(row.encrypted_key);
  const userKey = Buffer.from(userKeyHex, "hex");
  userKeyCache.set(userId, userKey);
  return userKey;
}

/**
 * Generate and store a new per-user encryption key.
 * Call this during user registration or onboarding.
 */
export async function createUserKey(userId: string): Promise<void> {
  // Check if user already has a key — avoid duplicate insert
  const [existing] = await db
    .select({ user_id: userKeysTable.user_id })
    .from(userKeysTable)
    .where(eq(userKeysTable.user_id, userId));

  if (existing) {
    if (!userKeyCache.has(userId)) {
      const [row] = await db
        .select({ encrypted_key: userKeysTable.encrypted_key })
        .from(userKeysTable)
        .where(eq(userKeysTable.user_id, userId));
      if (row) {
        const keyHex = decrypt(row.encrypted_key);
        userKeyCache.set(userId, Buffer.from(keyHex, "hex"));
      }
    }
    return;
  }

  const newUserKey = randomBytes(32);
  const encryptedUserKey = encrypt(newUserKey.toString("hex"));

  await db.insert(userKeysTable).values({
    user_id: userId,
    encrypted_key: encryptedUserKey,
    key_version: 1,
  }).onConflictDoNothing();

  // Always read back the persisted key to handle race conditions.
  // With onConflictDoNothing(), our insert may have been silently dropped
  // if another concurrent request inserted first. Caching the locally-generated
  // key would then poison the cache with a key that doesn't match the DB.
  const [persisted] = await db
    .select({ encrypted_key: userKeysTable.encrypted_key })
    .from(userKeysTable)
    .where(eq(userKeysTable.user_id, userId));

  if (persisted) {
    const persistedKeyHex = decrypt(persisted.encrypted_key);
    userKeyCache.set(userId, Buffer.from(persistedKeyHex, "hex"));
  }
}

/**
 * Encrypt data using a specific user's key.
 * Output format: v1:iv:authTag:ciphertext
 */
export function encryptForUser(
  plaintext: string,
  userKey: Buffer,
  version: string = CURRENT_KEY_VERSION,
): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, userKey, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [version, iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}

/**
 * Decrypt data using a specific user's key.
 * Automatically handles versioned and legacy formats.
 */
export function decryptForUser(encrypted: string, userKey: Buffer): string {
  // Handle empty or null encrypted values
  if (!encrypted || encrypted.trim() === '') {
    return '';
  }

  // If the value doesn't look like encrypted data, return it as-is (plain text / legacy data)
  if (!isEncrypted(encrypted)) {
    return encrypted;
  }

  try {
    const { iv, authTag, ciphertext } = parseEncrypted(encrypted);
    const decipher = createDecipheriv(ALGORITHM, userKey, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    // User key failed — try master key as fallback (handles data encrypted with encrypt() instead of encryptForUser())
    try {
      return decrypt(encrypted);
    } catch {
      console.warn("[encryption] decryptForUser failed with both user key and master key — returning placeholder for value:", encrypted.slice(0, 20) + "...");
      return "[Encrypted]";
    }
  }
}

/**
 * Convenience: encrypt data for a user by their ID.
 */
export async function encryptWithUserKey(userId: string, plaintext: string): Promise<string> {
  const userKey = await getUserKey(userId);
  return encryptForUser(plaintext, userKey);
}

/**
 * Convenience: decrypt data for a user by their ID.
 */
export async function decryptWithUserKey(userId: string, encrypted: string): Promise<string> {
  const userKey = await getUserKey(userId);
  return decryptForUser(encrypted, userKey);
}

/**
 * Check if data needs re-encryption with the current key version.
 */
export function needsReencryption(encrypted: string): boolean {
  try {
    // Handle empty or invalid encrypted values
    if (!encrypted || encrypted.trim() === '') {
      return false;
    }
    const { version } = parseEncrypted(encrypted);
    return version !== CURRENT_KEY_VERSION;
  } catch (error) {
    // If we can't parse the encrypted value, assume it doesn't need re-encryption
    console.error('Failed to check re-encryption needs:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

/**
 * Clear the in-memory key cache.
 */
export function clearUserKeyCache(): void {
  userKeyCache.clear();
  masterKeyCache.clear();
}

// ---------------------------------------------------------------------------
// Master key rotation
// ---------------------------------------------------------------------------

/**
 * Rotate the master key by re-encrypting all user keys.
 * The new key must be set as ENCRYPTION_KEY_V2 (or next version) in env vars.
 */
export async function rotateMasterKey(): Promise<number> {
  const currentVersionNum = parseInt(CURRENT_KEY_VERSION.replace("v", ""), 10);
  const newVersion = `v${currentVersionNum + 1}`;
  const newEnvVar = `ENCRYPTION_KEY_${newVersion.toUpperCase()}`;

  const newKeyHex = process.env[newEnvVar];
  if (!newKeyHex) {
    throw new Error(`${newEnvVar} env var is not set. Add the new key before rotating.`);
  }

  const newKey = Buffer.from(newKeyHex, "hex");

  const allUserKeys = await db.select().from(userKeysTable);
  let rotated = 0;

  for (const row of allUserKeys) {
    const userKeyHex = decrypt(row.encrypted_key);
    const newEncrypted = encryptWithKey(userKeyHex, newKey, newVersion);

    await db
      .update(userKeysTable)
      .set({
        encrypted_key: newEncrypted,
        key_version: row.key_version + 1,
        updated_at: new Date(),
      })
      .where(eq(userKeysTable.user_id, row.user_id));

    userKeyCache.delete(row.user_id);
    rotated++;
  }

  return rotated;
}

function encryptWithKey(plaintextHex: string, key: Buffer, version: string = CURRENT_KEY_VERSION): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(plaintextHex, "hex")),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return [version, iv.toString("hex"), authTag.toString("hex"), encrypted.toString("hex")].join(":");
}
