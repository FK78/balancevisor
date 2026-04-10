import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/lib/env';

const globalForDb = globalThis as unknown as {
  pgClient: ReturnType<typeof postgres>;
  adminPgClient: ReturnType<typeof postgres>;
  db: PostgresJsDatabase;
  adminDb: PostgresJsDatabase;
};

function sslConfig(url: string, caCert?: string) {
  const isLocalhost = /localhost|127\.0\.0\.1/.test(url);
  if (isLocalhost) return false;
  return caCert ? { ca: caCert } : 'require' as const;
}

/**
 * Primary application DB connection.
 * When RLS is enabled, use `withRLS(userId, fn)` from `@/lib/rls-db`
 * to scope queries to a specific user via `SET LOCAL app.current_user_id`.
 */
function createDb(): PostgresJsDatabase {
  const { DATABASE_URL, DATABASE_CA_CERT } = env();

  const client = globalForDb.pgClient ?? postgres(DATABASE_URL, {
    ssl: sslConfig(DATABASE_URL, DATABASE_CA_CERT),
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForDb.pgClient = client;
  }

  return drizzle(client);
}

/**
 * Privileged admin DB connection that bypasses RLS.
 * Uses DATABASE_ADMIN_URL if set, otherwise falls back to DATABASE_URL.
 *
 * Use ONLY for:
 * - Cron jobs that iterate over all users
 * - CLI scripts (delete-user, migrations)
 * - Admin operations that need cross-user access
 */
function createAdminDb(): PostgresJsDatabase {
  const { DATABASE_URL, DATABASE_CA_CERT } = env();
  const adminUrl = process.env.DATABASE_ADMIN_URL || DATABASE_URL;

  const client = globalForDb.adminPgClient ?? postgres(adminUrl, {
    ssl: sslConfig(adminUrl, DATABASE_CA_CERT),
    max: 3,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForDb.adminPgClient = client;
  }

  return drizzle(client);
}

export const db: PostgresJsDatabase = new Proxy({} as PostgresJsDatabase, {
  get(_, prop) {
    if (!globalForDb.db) {
      globalForDb.db = createDb();
    }
    return Reflect.get(globalForDb.db, prop);
  },
});

export const adminDb: PostgresJsDatabase = new Proxy({} as PostgresJsDatabase, {
  get(_, prop) {
    if (!globalForDb.adminDb) {
      globalForDb.adminDb = createAdminDb();
    }
    return Reflect.get(globalForDb.adminDb, prop);
  },
});