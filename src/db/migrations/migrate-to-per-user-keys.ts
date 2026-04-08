/**
 * Migration: Convert from single master key to per-user envelope encryption.
 *
 * This script:
 * 1. Creates the user_keys table (if not exists)
 * 2. Wipes existing encrypted data (since the original key is lost)
 * 3. Generates a unique key for each existing user
 * 4. Re-encrypts all existing data with the user's key
 *
 * Run with:
 *   npx tsx src/db/migrations/migrate-to-per-user-keys.ts
 *
 * Requires ENCRYPTION_KEY and DATABASE_URL in .env
 */

import "dotenv/config";
import postgres from "postgres";
import { randomBytes } from "crypto";
import { encrypt, isEncrypted, encryptForUser } from "@/lib/encryption";

const client = postgres(process.env.DATABASE_URL!, {
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log("Starting per-user key migration...\n");

  // 1. Create user_keys table
  console.log("[1/7] Creating user_keys table...");
  await client`
    CREATE TABLE IF NOT EXISTS user_keys (
      user_id UUID PRIMARY KEY,
      encrypted_key TEXT NOT NULL,
      key_version INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  // Clear existing user keys
  console.log("  Clearing existing user keys...");
  await client`DELETE FROM user_keys`;

  // 2. Wipe existing encrypted data (original key is lost)
  console.log("[2/7] Wiping existing encrypted data...");
  await client`UPDATE accounts SET name = '' WHERE name ~ '^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$'`;
  await client`UPDATE transactions SET description = '' WHERE description ~ '^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$'`;
  await client`UPDATE truelayer_connections SET access_token = '', refresh_token = '' WHERE access_token ~ '^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$'`;
  console.log("  Wiped encrypted data");

  // 3. Get all unique user IDs from all tables
  console.log("[3/7] Collecting unique user IDs...");
  const userResult = await client`
    SELECT DISTINCT user_id FROM (
      SELECT user_id FROM accounts
      UNION
      SELECT user_id FROM truelayer_connections
      UNION
      SELECT user_id FROM categories
      UNION
      SELECT user_id FROM budgets
      UNION
      SELECT user_id FROM goals
    ) all_users
    WHERE user_id IS NOT NULL
  `;
  const userIds = userResult.map((r) => r.user_id as string);
  console.log(`  Found ${userIds.length} unique users`);

  // 4. Generate and store per-user keys — keep plaintext in memory for this migration
  console.log("[4/7] Generating per-user keys...");
  const userKeyMap = new Map<string, Buffer>();
  for (const userId of userIds) {
    const userKeyPlain = randomBytes(32);
    const encryptedKey = encrypt(userKeyPlain.toString("hex"));
    await client`
      INSERT INTO user_keys (user_id, encrypted_key, key_version)
      VALUES (${userId}, ${encryptedKey}, 1)
    `;
    userKeyMap.set(userId, userKeyPlain);
  }
  console.log(`  Generated keys for ${userIds.length} users`);

  // 5. Re-encrypt account names (only non-empty ones)
  console.log("[5/7] Re-encrypting account names...");
  const accounts = await client`SELECT id, user_id, name FROM accounts WHERE name != ''`;
  let accountCount = 0;
  for (const account of accounts) {
    const userKeyPlain = userKeyMap.get(account.user_id as string);
    if (!userKeyPlain) continue;

    const reEncrypted = encryptForUser(account.name as string, userKeyPlain);
    await client`UPDATE accounts SET name = ${reEncrypted} WHERE id = ${account.id}`;
    accountCount++;
  }
  console.log(`  Re-encrypted ${accountCount} account names`);

  // 6. Re-encrypt transaction descriptions (only non-empty ones)
  console.log("[6/7] Re-encrypting transaction descriptions...");
  const transactions = await client`SELECT id, account_id, description FROM transactions WHERE description != ''`;
  let txnCount = 0;
  for (const txn of transactions) {
    // Get user_id from the account
    const accountRow = await client`SELECT user_id FROM accounts WHERE id = ${txn.account_id}`;
    if (accountRow.length === 0) continue;
    const userId = accountRow[0].user_id as string;

    const userKeyPlain = userKeyMap.get(userId);
    if (!userKeyPlain) continue;

    const reEncrypted = encryptForUser(txn.description as string, userKeyPlain);
    await client`UPDATE transactions SET description = ${reEncrypted} WHERE id = ${txn.id}`;
    txnCount++;
  }
  console.log(`  Re-encrypted ${txnCount} transaction descriptions`);

  // 7. Note about TrueLayer connections
  console.log("[7/7] TrueLayer connections...");
  console.log("  WARNING: TrueLayer tokens have been wiped. Users will need to reconnect their bank accounts.");

  console.log("\nPer-user key migration complete!");
  console.log("\nIMPORTANT: Users with TrueLayer connections will need to reconnect their bank accounts.");
  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  client.end();
  process.exit(1);
});
