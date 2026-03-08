import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "@neondatabase/serverless";

const globalForDb = globalThis as typeof globalThis & {
  __applyxPool?: Pool;
};

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function createPool() {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (!connectionString) {
    return null;
  }

  return new Pool({
    connectionString,
    max: 10,
  });
}

function getPool() {
  if (globalForDb.__applyxPool) {
    return globalForDb.__applyxPool;
  }

  const pool = createPool();

  if (!pool) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__applyxPool = pool;
  }

  return pool;
}

export function isDatabaseConnectionError(error: unknown) {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";

  if (["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT"].includes(code)) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  return /connect ECONNREFUSED|database .* does not exist|password authentication failed|DATABASE_URL is not configured/i.test(
    error.message,
  );
}

export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: readonly unknown[] = [],
) {
  return getPool().query<T>(text, [...values]);
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
) {
  const client = await getPool().connect();

  try {
    await client.query("begin");
    const result = await callback(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export function firstRow<T extends QueryResultRow>(result: QueryResult<T>) {
  return result.rows[0] ?? null;
}
