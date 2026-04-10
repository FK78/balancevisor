/**
 * Migration: Add user_id to transactions table.
 *
 * Run once after deploying the schema change.
 * Backfills user_id from the parent accounts table.
 *
 * Usage: npx tsx src/db/migrations/add-transactions-user-id.ts
 */
import 'dotenv/config';
import { adminDb as db } from '@/index';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Backfilling transactions.user_id from accounts...');

  const result = await db.execute(sql`
    UPDATE transactions
    SET user_id = accounts.user_id
    FROM accounts
    WHERE transactions.account_id = accounts.id
      AND transactions.user_id IS NULL
  `);

  console.log('Backfill complete.', result);
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
