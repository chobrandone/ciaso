// Creates/updates tables, loads initial content into empty tables, and creates the first admin.
// Usage: npm run db:setup                    (safe to run any time)
//        npm run db:setup -- --reset-events  (replace ALL events with the seed events)
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applySchema } from '../db/schema.mjs';
import { events, stories, videos } from '../db/seed-data.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const url = process.env.DATABASE_URL || 'file:./data/ciaso.db';
if (url.startsWith('file:./data/')) mkdirSync('data', { recursive: true });
const db = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });

await applySchema((sql) => db.execute(sql));
console.log('✓ Schema ready');

const insert = (table, row) => {
  const cols = Object.keys(row);
  return db.execute({ sql: `INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`, args: cols.map((c) => row[c]) });
};
const count = async (table) => Number((await db.execute(`SELECT COUNT(*) AS n FROM ${table}`)).rows[0].n);
const image = (file) => ({ data: readFileSync(join(root, 'db', 'seed-images', file)), mime: 'image/jpeg' });

async function seedEvents() {
  if (process.argv.includes('--reset-events')) {
    await db.execute('DELETE FROM event_images');
    await db.execute('DELETE FROM events');
    console.log('• events: cleared (--reset-events)');
  } else if (await count('events')) {
    console.log(`• events: ${await count('events')} rows already present, skipped`);
    return;
  }
  for (const { image: file, gallery = [], ...row } of events) {
    const flyer = file ? image(file) : null;
    const res = await insert('events', { ...row, image: flyer?.data ?? null, image_type: flyer?.mime ?? null });
    const id = Number(res.lastInsertRowid);
    for (const [i, g] of gallery.entries()) {
      const img = image(g);
      await insert('event_images', { event_id: id, data: img.data, mime: img.mime, sort_order: i });
    }
  }
  console.log(`✓ events: ${events.length} rows loaded (with flyers)`);
}

async function seed(table, rows) {
  const n = await count(table);
  if (n) { console.log(`• ${table}: ${n} rows already present, skipped`); return; }
  for (const row of rows) await insert(table, row);
  console.log(`✓ ${table}: ${rows.length} rows loaded`);
}

await seedEvents();
await seed('stories', stories);
await seed('videos', videos);
// Existing installs: place the seeded videos (new `placement` column)
for (const v of videos) await db.execute({ sql: 'UPDATE videos SET placement = ? WHERE youtube_id = ?', args: [v.placement, v.youtube_id] });

if (await count('admins')) {
  console.log(`• admins: ${await count('admins')} account(s) already present, skipped`);
} else {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) {
    console.error('✗ Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) to create the first admin.');
    process.exit(1);
  }
  await insert('admins', { email, name: process.env.ADMIN_NAME || 'CIASO Admin', password_hash: await bcrypt.hash(password, 12) });
  console.log(`✓ admin created: ${email}`);
}
db.close();
