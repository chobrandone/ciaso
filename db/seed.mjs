// Loads the initial content (events with flyers and photos, stories, videos) and the first admin.
// Used by scripts/setup-db.mjs and by the app itself, which seeds an empty hosted database
// (e.g. Turso on Vercel) on its first request, so no manual step is needed after deploying.
import bcrypt from 'bcryptjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { events, stories, videos } from './seed-data.mjs';

/** Caption that marks a stand-in photo; uploading real photos for that event replaces them. */
export const PLACEHOLDER_CAPTION = 'Placeholder – event photos coming soon';

/** Tops every event up to 6 photos with the branded placeholder images. */
export async function addPlaceholderPhotos(exec, { root = process.cwd(), log = () => {} } = {}) {
  const { rows } = await exec('SELECT id, (SELECT COUNT(*) FROM event_images g WHERE g.event_id = e.id) AS n, (SELECT COALESCE(MAX(sort_order), -1) FROM event_images g WHERE g.event_id = e.id) AS last FROM events e');
  const short = rows.filter((r) => Number(r.n) < 6);
  const images = [1, 2, 3, 4, 5, 6].map((n) => readFileSync(join(root, 'db', 'seed-images', `placeholder-${n}.jpg`)));
  for (const { id, n, last } of short) {
    for (const [i, data] of images.slice(0, 6 - Number(n)).entries()) {
      await exec('INSERT INTO event_images (event_id, data, mime, caption, sort_order) VALUES (?, ?, ?, ?, ?)', [id, data, 'image/jpeg', PLACEHOLDER_CAPTION, Number(last) + 1 + i]);
    }
  }
  log(`✓ placeholder photos: ${short.length} event(s) topped up to 6 photos`);
}

/**
 * `exec(sql, args)` must return { rows, rowsAffected, lastInsertRowid }.
 * Tables that already contain rows are left alone (unless resetEvents is set).
 */
export async function seedContent(exec, { root = process.cwd(), resetEvents = false, log = () => {} } = {}) {
  const insert = (table, row) => {
    const cols = Object.keys(row);
    return exec(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`, cols.map((c) => row[c]));
  };
  const count = async (table) => Number((await exec(`SELECT COUNT(*) AS n FROM ${table}`)).rows[0].n);
  const image = (file) => ({ data: readFileSync(join(root, 'db', 'seed-images', file)), mime: 'image/jpeg' });

  if (resetEvents) {
    await exec('DELETE FROM event_images');
    await exec('DELETE FROM events');
    log('• events: cleared (--reset-events)');
  }
  if (await count('events')) {
    log(`• events: ${await count('events')} rows already present, skipped`);
  } else {
    for (const { image: file, gallery = [], ...row } of events) {
      const flyer = file ? image(file) : null;
      const res = await insert('events', { ...row, image: flyer?.data ?? null, image_type: flyer?.mime ?? null });
      const id = Number(res.lastInsertRowid);
      for (const [i, g] of gallery.entries()) {
        const img = image(g);
        await insert('event_images', { event_id: id, data: img.data, mime: img.mime, sort_order: i });
      }
    }
    log(`✓ events: ${events.length} rows loaded (with flyers and photos)`);
  }

  for (const [table, rows] of [['stories', stories], ['videos', videos]]) {
    const n = await count(table);
    if (n) { log(`• ${table}: ${n} rows already present, skipped`); continue; }
    for (const row of rows) await insert(table, row);
    log(`✓ ${table}: ${rows.length} rows loaded`);
  }
  // Older installs: place the seeded videos (`placement` column was added later)
  for (const v of videos) await exec('UPDATE videos SET placement = ? WHERE youtube_id = ?', [v.placement, v.youtube_id]);

  if (await count('admins')) {
    log(`• admins: ${await count('admins')} account(s) already present, skipped`);
    return { adminCreated: false };
  }
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 12) {
    log('✗ No admin yet: set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) to create the first admin.');
    return { adminCreated: false, adminMissing: true };
  }
  await insert('admins', { email, name: process.env.ADMIN_NAME || 'CIASO Admin', password_hash: await bcrypt.hash(password, 12) });
  log(`✓ admin created: ${email}`);
  return { adminCreated: true };
}

/**
 * Seeds once per database: the first process to claim the `seeded` marker does the work,
 * so several serverless instances starting together never load the content twice.
 */
export async function seedOnce(exec, opts) {
  await exec('CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT)');
  // Each step runs once per database; on failure its marker is released so the next request retries.
  const once = async (key, fn) => {
    const claim = await exec("INSERT OR IGNORE INTO app_meta (key, value) VALUES (?, datetime('now'))", [key]);
    if (!claim.rowsAffected) return false;
    try { await fn(); } catch (err) { await exec('DELETE FROM app_meta WHERE key = ?', [key]); throw err; }
    return true;
  };
  const seeded = await once('seeded', () => seedContent(exec, opts));
  if (!seeded) {
    // Content is seeded; still create the first admin if its variables were added later
    const admins = Number((await exec('SELECT COUNT(*) AS n FROM admins')).rows[0].n);
    if (!admins && process.env.ADMIN_EMAIL && (process.env.ADMIN_PASSWORD ?? '').length >= 12) {
      await exec('INSERT OR IGNORE INTO admins (email, name, password_hash) VALUES (?, ?, ?)',
        [process.env.ADMIN_EMAIL, process.env.ADMIN_NAME || 'CIASO Admin', await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)]);
    }
  }
  await once('placeholder-photos-v2', () => addPlaceholderPhotos(exec, opts));
}
