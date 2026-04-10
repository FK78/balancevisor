import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const globalForDb = globalThis as unknown as {
  pgClient: ReturnType<typeof postgres>;
  db: PostgresJsDatabase;
};

function createDb(): PostgresJsDatabase {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

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