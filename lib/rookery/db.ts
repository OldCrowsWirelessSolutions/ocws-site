import { createClient, type Client } from "@libsql/client";
import { MIGRATIONS } from "./migrations";

/**
 * Server-ONLY migrations — schema changes that exist only in the multi-tenant
 * ocws-site deployment, NOT in the desktop single-user app. Kept separate from
 * MIGRATIONS (which is auto-generated from desktop db.ts and would drop these on
 * regen) and tracked under their own `server_schema_version` meta key.
 *
 * Each entry runs once, in order, via executeMultiple. SQLite has no idempotent
 * "ADD COLUMN IF NOT EXISTS", so guard column adds with a try/catch in the runner.
 */
const SERVER_MIGRATIONS: string[] = [
  // #1 — Field projects get an owner so the workbench is tenant-scoped.
  //      owner_account_id = the Rookery account CODE that owns the project.
  //      Existing (legacy) rows stay NULL → visible to admins only.
  "ALTER TABLE projects ADD COLUMN owner_account_id TEXT;"
];

/**
 * libSQL (Turso) connection + migration runner for the Rookery learning brain
 * running inside ocws-site. This is the server counterpart of the desktop
 * electron/services/db.ts — same schema (migrations are auto-generated from it),
 * but async (remote DB) and Turso-compatible.
 *
 * Two Turso-specific differences from the desktop better-sqlite3 version:
 *  - Schema version is tracked in a `_rookery_meta` row, because Turso blocks
 *    `PRAGMA user_version = N` over the remote protocol.
 *  - Migrations are applied via `executeMultiple` (multi-statement SQL).
 *
 * Env (set in Vercel + .env.local): TURSO_DATABASE_URL, TURSO_AUTH_TOKEN.
 */

let _client: Client | null = null;

export function getDb(): Client {
  if (_client) return _client;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  _client = createClient({ url, authToken });
  return _client;
}

async function readVersion(db: Client): Promise<number> {
  await db.execute(
    "CREATE TABLE IF NOT EXISTS _rookery_meta(key TEXT PRIMARY KEY, value INTEGER)"
  );
  const r = await db.execute({
    sql: "SELECT value FROM _rookery_meta WHERE key = ?",
    args: ["schema_version"]
  });
  return r.rows.length ? Number(r.rows[0].value) : 0;
}

async function readMeta(db: Client, key: string): Promise<number> {
  const r = await db.execute({ sql: "SELECT value FROM _rookery_meta WHERE key = ?", args: [key] });
  return r.rows.length ? Number(r.rows[0].value) : 0;
}

async function runMigrations(): Promise<void> {
  const db = getDb();
  const current = await readVersion(db);
  const target = MIGRATIONS.length;
  for (let i = current; i < target; i++) {
    await db.executeMultiple(MIGRATIONS[i]);
  }
  if (current < target) {
    await db.execute({
      sql: "INSERT OR REPLACE INTO _rookery_meta(key, value) VALUES(?, ?)",
      args: ["schema_version", target]
    });
  }

  // Server-only migrations, tracked separately so a MIGRATIONS regen can't undo them.
  const serverCurrent = await readMeta(db, "server_schema_version");
  for (let i = serverCurrent; i < SERVER_MIGRATIONS.length; i++) {
    try {
      await db.executeMultiple(SERVER_MIGRATIONS[i]);
    } catch (e) {
      // Tolerate "duplicate column" so a partially-applied/legacy DB converges.
      if (!/duplicate column|already exists/i.test((e as Error).message)) throw e;
    }
  }
  if (serverCurrent < SERVER_MIGRATIONS.length) {
    await db.execute({
      sql: "INSERT OR REPLACE INTO _rookery_meta(key, value) VALUES(?, ?)",
      args: ["server_schema_version", SERVER_MIGRATIONS.length]
    });
  }
}

let migratedPromise: Promise<void> | null = null;

/**
 * Ensure the schema is up to date. Idempotent + memoized per warm serverless
 * instance, so it's a cheap no-op after the first call (a single meta read).
 * Every route handler should `await ensureMigrated()` before querying.
 */
export function ensureMigrated(): Promise<void> {
  if (!migratedPromise) migratedPromise = runMigrations();
  return migratedPromise;
}
