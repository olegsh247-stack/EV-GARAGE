import pg from "pg";

type GlobalPg = typeof globalThis & { pgPool?: pg.Pool };

function logPg(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) return;
  const err = error as { code?: string; message?: string; detail?: string };
  console.error("[pg]", err.code ?? "", err.message ?? "", err.detail ?? "");
}

export function getPool(): pg.Pool {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }
  const globalPg = globalThis as GlobalPg;
  if (!globalPg.pgPool) {
    const pool = new pg.Pool({ connectionString: databaseUrl });
    pool.on("error", (error) => {
      console.error("[pg] idle client error", error.message);
    });
    globalPg.pgPool = pool;
  }
  return globalPg.pgPool;
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
) {
  try {
    return await getPool().query<T>(text, params);
  } catch (error) {
    logPg(error);
    throw error;
  }
}

export async function withTransaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      logPg(rollbackError);
    }
    logPg(error);
    throw error;
  } finally {
    client.release();
  }
}
