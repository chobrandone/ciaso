// Creates/updates tables, loads initial content into empty tables, and creates the first admin.
// Usage: npm run db:setup                    (safe to run any time)
//        npm run db:setup -- --reset-events  (replace ALL events with the seed events)
// The deployed app also seeds an empty database by itself on its first request (see db/seed.mjs).
import { createClient } from '@libsql/client';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applySchema } from '../db/schema.mjs';
import { seedContent, seedOnce } from '../db/seed.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || 'file:./data/ciaso.db';
if (url.startsWith('file:./data/')) mkdirSync('data', { recursive: true });
const db = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined });

await applySchema((sql) => db.execute(sql));
console.log('✓ Schema ready');

const exec = (sql, args = []) => db.execute({ sql, args });
const { adminMissing } = await seedContent(exec, { root, resetEvents: process.argv.includes('--reset-events'), log: console.log });
await seedOnce(exec, { root, log: console.log }); // one-time steps, e.g. placeholder photos
db.close();
if (adminMissing) process.exit(1);
