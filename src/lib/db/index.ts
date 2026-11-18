import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
  db: NodePgDatabase<typeof schema> | undefined;
};

export function getDatabasePool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not configured. Please set DATABASE_URL in your environment or .env file."
    );
  }

  if (!globalForDb.pool) {
    globalForDb.pool = new Pool({
      connectionString,
    });
  }

  return globalForDb.pool;
}

export function getDb(): NodePgDatabase<typeof schema> {
  if (!globalForDb.db) {
    const pool = getDatabasePool();
    globalForDb.db = drizzle(pool, { schema });
  }
  return globalForDb.db;
}

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop) {
    const database = getDb();
    return Reflect.get(database, prop);
  },
});
