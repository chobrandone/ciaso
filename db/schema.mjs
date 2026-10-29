// Database schema shared by the app (src/lib/db.ts) and scripts/setup-db.mjs.
// Everything here is idempotent, so it runs safely on every start.
export const schema = [
  `CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK (type IN ('support','contact','volunteer','partner')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    organization TEXT,
    topic TEXT,
    interests TEXT,
    contact_preference TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','closed')),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS submissions_type_status ON submissions (type, status, created_at)`,
  `CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    date_text TEXT,
    time_text TEXT,
    format TEXT,
    location TEXT,
    description TEXT NOT NULL,
    eligibility TEXT,
    deadline TEXT,
    register_url TEXT,
    details_url TEXT,
    topics TEXT,
    published INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS event_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    data BLOB NOT NULL,
    mime TEXT NOT NULL,
    caption TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS event_images_event ON event_images (event_id, sort_order)`,
  `CREATE TABLE IF NOT EXISTS site_content (
    section TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_by TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS email_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER,
    kind TEXT NOT NULL CHECK (kind IN ('admin','autoreply')),
    to_addr TEXT NOT NULL,
    subject TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('sent','failed','skipped')),
    error TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS email_log_to ON email_log (to_addr, created_at)`,
  `CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data BLOB NOT NULL,
    mime TEXT NOT NULL,
    name TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location TEXT,
    theme TEXT NOT NULL,
    quote TEXT NOT NULL,
    tags TEXT,
    categories TEXT,
    lang TEXT NOT NULL DEFAULT 'en',
    featured INTEGER NOT NULL DEFAULT 0,
    consent_confirmed INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    youtube_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    source_label TEXT,
    is_short INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`
];

// Columns added after the first release. Added only if missing.
export const columns = [
  ['events', 'kind', "TEXT NOT NULL DEFAULT 'workshop'"],
  ['events', 'speaker', 'TEXT'],
  ['events', 'body', 'TEXT'],
  ['events', 'image', 'BLOB'],
  ['events', 'image_type', 'TEXT'],
  ['videos', 'placement', "TEXT NOT NULL DEFAULT 'home'"],
  // After-event recap: short summary, write-up and links to the full posts
  ['events', 'recap', 'TEXT'],
  ['events', 'recap_body', 'TEXT'],
  ['events', 'linkedin_url', 'TEXT'],
  ['events', 'facebook_url', 'TEXT']
];

/** Applies tables, indexes and added columns. `run(sql)` must return { rows }. */
export async function applySchema(run) {
  for (const sql of schema) await run(sql);
  for (const [table, column, ddl] of columns) {
    const { rows } = await run(`PRAGMA table_info(${table})`);
    if (!rows.some((r) => r.name === column)) await run(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
  }
}
