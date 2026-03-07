import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

type Database = Record<string, never>;

const globalForDatabase = globalThis as typeof globalThis & {
  __applyxPool?: Pool;
  __applyxDb?: Kysely<Database>;
};

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/applyx";

const pool =
  globalForDatabase.__applyxPool ??
  new Pool({
    connectionString,
  });

const db =
  globalForDatabase.__applyxDb ??
  new Kysely<Database>({
    dialect: new PostgresDialect({ pool }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.__applyxPool = pool;
  globalForDatabase.__applyxDb = db;
}

export { db, pool };
