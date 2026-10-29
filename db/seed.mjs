// Loads the initial content (events with flyers and photos, stories, videos) and the first admin.
// Used by scripts/setup-db.mjs and by the app itself, which seeds an empty hosted database
// (e.g. Turso on Vercel) on its first request, so no manual step is needed after deploying.
import bcrypt from 'bcryptjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { events, stories, videos } from './seed-data.mjs';

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
  const claim = await exec("INSERT OR IGNORE INTO app_meta (key, value) VALUES ('seeded', datetime('now'))");
  if (!claim.rowsAffected) {
    // Content is seeded; still create the first admin if its variables were added later
    const admins = Number((await exec('SELECT COUNT(*) AS n FROM admins')).rows[0].n);
    if (admins || !process.env.ADMIN_EMAIL || (process.env.ADMIN_PASSWORD ?? '').length < 12) return;
    await exec('INSERT OR IGNORE INTO admins (email, name, password_hash) VALUES (?, ?, ?)',
      [process.env.ADMIN_EMAIL, process.env.ADMIN_NAME || 'CIASO Admin', await bcrypt.hash(process.env.ADMIN_PASSWORD, 12)]);
    return;
  }
  try {
    await seedContent(exec, opts);
  } catch (err) {
    await exec("DELETE FROM app_meta WHERE key = 'seeded'"); // let the next request try again
    throw err;
  }
}
