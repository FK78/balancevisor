import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const globalForDb = globalThis as unknown as { pgClient: ReturnType<typeof postgres> };

const isLocalhost = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL);

const client = globalForDb.pgClient ?? postgres(process.env.DATABASE_URL, {
  ssl: isLocalhost ? false : process.env.DATABASE_CA_CERT
    ? { ca: process.env.DATABASE_CA_CERT }
    : 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

if (process.env.NODE_ENV !== 'production') {
  globalForDb.pgClient = client;
}

export const db = drizzle(client);