import 'server-only';
import { createClient, type Client, type InValue } from '@libsql/client';
import { mkdirSync } from 'node:fs';
import { applySchema } from '../../db/schema.mjs';

const url = process.env.DATABASE_URL || 'file:./data/ciaso.db';

const globalForDb = globalThis as unknown as { ciasoDb?: Client; ciasoSchema?: Promise<void> };

function client(): Client {
  if (!globalForDb.ciasoDb) {
    if (url.startsWith('file:./data/')) mkdirSync('data', { recursive: true });
    globalForDb.ciasoDb = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
  }
  return globalForDb.ciasoDb;
}

/** Ensures tables exist (idempotent) before the first query in this process. */
function ready(): Promise<void> {
  if (!globalForDb.ciasoSchema) {
    globalForDb.ciasoSchema = (async () => {
      await client().execute('PRAGMA foreign_keys = ON');
      await applySchema((sql) => client().execute(sql));
    })();
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
