import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { loadEnv } from "./load-env.mjs";

loadEnv();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const dir = path.resolve("migrations/postgres");
const files = fs
  .readdirSync(dir)
  .filter((name) => name.endsWith(".sql"))
  .sort();

const pool = new pg.Pool({ connectionString: databaseUrl });

function logPg(error) {
  const err = error ?? {};
  console.error("[pg]", err.code ?? "", err.message ?? error, err.detail ?? "");
}

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  const applied = await pool.query(
    "SELECT filename, checksum FROM schema_migrations",
  );
  const byName = new Map(applied.rows.map((row) => [row.filename, row.checksum]));

  let appliedNow = 0;
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    const checksum = crypto.createHash("sha256").update(sql).digest("hex");
    const previous = byName.get(file);
    if (previous) {
      if (previous !== checksum) {
        console.error(`checksum mismatch for applied migration ${file}`);
        process.exitCode = 1;
        break;
      }
      continue;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query(
        "INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)",
        [file, checksum],
      );
      await client.query("COMMIT");
      appliedNow += 1;
      console.log("applied", file);
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        logPg(rollbackError);
      }
      console.error("migration failed", file);
      logPg(error);
      process.exitCode = 1;
      break;
    } finally {
      client.release();
    }
  }

  if (!process.exitCode) {
    console.log(
      `migrations applied: ${appliedNow}, skipped: ${files.length - appliedNow}`,
    );
  }
} catch (error) {
  logPg(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}

if (process.exitCode) process.exit(process.exitCode);
