import 'server-only';
import { createClient, type Client, type InValue } from '@libsql/client';
import { mkdirSync } from 'node:fs';
import { applySchema } from '../../db/schema.mjs';
import { seedOnce } from '../../db/seed.mjs';

// DATABASE_* or the TURSO_* names that Vercel's Turso integration adds automatically
const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || 'file:./data/ciaso.db';
const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined;

// Serverless hosts (Vercel) have a read-only file system, so a local SQLite file cannot work there.
const SERVERLESS = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);

const globalForDb = globalThis as unknown as { ciasoDb?: Client; ciasoSchema?: Promise<void> };

function client(): Client {
  if (!globalForDb.ciasoDb) {
    if (SERVERLESS && url.startsWith('file:')) {
      throw new Error(
        'No hosted database is configured. On Vercel the file system is read-only, so set DATABASE_URL and ' +
        'DATABASE_AUTH_TOKEN (or TURSO_DATABASE_URL and TURSO_AUTH_TOKEN) in Project Settings → ' +
        'Environment Variables, then redeploy. See README → Deploy → Vercel.'
      );
    }
    if (url.startsWith('file:./data/')) mkdirSync('data', { recursive: true });
    globalForDb.ciasoDb = createClient({ url, authToken });
  }
  return globalForDb.ciasoDb;
}

/** Ensures tables exist (idempotent) before the first query in this process. */
function ready(): Promise<void> {
  if (!globalForDb.ciasoSchema) {
    globalForDb.ciasoSchema = (async () => {
      await client().execute('PRAGMA foreign_keys = ON');
      await applySchema((sql) => client().execute(sql));
      // A new, empty database (e.g. Turso on Vercel) gets the events, flyers, photos, stories and videos automatically
      await seedOnce((sql, args = []) => client().execute({ sql, args: args as InValue[] }), { log: (m) => console.log(`[seed] ${m}`) });
    })().catch((err) => {
      globalForDb.ciasoSchema = undefined; // retry on the next request instead of failing forever
      throw err;
    });
  }
  return globalForDb.ciasoSchema;
}

export async function query<T = Record<string, unknown>>(sql: string, args: InValue[] = []): Promise<T[]> {
  await ready();
  const res = await client().execute({ sql, args });
  return res.rows.map((r) => ({ ...r }) as T);
}

export async function queryOne<T = Record<string, unknown>>(sql: string, args: InValue[] = []): Promise<T | null> {
  const rows = await query<T>(sql, args);
  return rows[0] ?? null;
}

export async function execute(sql: string, args: InValue[] = []) {
  await ready();
  const res = await client().execute({ sql, args });
  return { rowsAffected: res.rowsAffected, lastInsertId: res.lastInsertRowid ? Number(res.lastInsertRowid) : null };
}
