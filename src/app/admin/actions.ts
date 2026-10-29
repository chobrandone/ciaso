'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { execute, query, queryOne } from '@/lib/db';
import { checkPassword, endSession, hashPassword, requireAdmin, startSession, verifyCredentials } from '@/lib/auth';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { parseYouTubeId } from '@/lib/youtube';
import { todayEdmonton } from '@/lib/data';
import { MAX_EVENT_PHOTOS } from '@/lib/ui';
import { getContent } from '@/lib/content';
import { sections as contentSections, type Field, type SectionId } from '@/lib/content-schema';

const str = (fd: FormData, key: string) => String(fd.get(key) ?? '').trim();
const optStr = (fd: FormData, key: string) => str(fd, key) || null;
const flag = (fd: FormData, key: string) => (fd.get(key) === 'on' ? 1 : 0);
const back = (path: string, params: Record<string, string>): never => redirect(`${path}?${new URLSearchParams(params)}`);
const firstIssue = (e: z.ZodError) => e.issues[0]?.message ?? 'Please check the form.';

/* ---------- Auth ---------- */

export type LoginState = { error?: string };

export async function loginAction(_: LoginState, fd: FormData): Promise<LoginState> {
  const ip = clientIp(await headers());
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000)) return { error: 'Too many sign-in attempts. Please wait 15 minutes and try again.' };
  const email = str(fd, 'email');
  const password = String(fd.get('password') ?? '');
  if (!email || !password) return { error: 'Enter your email and password.' };
  const admin = await verifyCredentials(email, password);
  if (!admin) return { error: 'That email and password combination is not correct.' };
  await startSession(admin);
  const next = str(fd, 'next');
  redirect(next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin');
}

export async function logoutAction() {
  await endSession();
  redirect('/admin/login');
}

/* ---------- Submissions ---------- */

export async function updateSubmission(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get('id'));
  const status = z.enum(['new', 'in_progress', 'closed']).parse(fd.get('status'));
  await execute("UPDATE submissions SET status = ?, notes = ?, updated_at = datetime('now') WHERE id = ?", [status, optStr(fd, 'notes'), id]);
  revalidatePath('/admin', 'layout');
  back(`/admin/submissions/${id}`, { saved: '1' });
}

export async function deleteSubmission(fd: FormData) {
  await requireAdmin();
  await execute('DELETE FROM submissions WHERE id = ?', [Number(fd.get('id'))]);
  revalidatePath('/admin', 'layout');
  back('/admin/submissions', { deleted: '1' });
}

/* ---------- Events ---------- */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Dates must be in YYYY-MM-DD format.');
const url = z.string().url('Links must be full URLs starting with https://').max(500);
const eventSchema = z.object({
  kind: z.enum(['event', 'workshop']),
  title: z.string().min(1, 'Title is required.').max(200),
  date: isoDate,
  date_text: z.string().max(80).nullable(),
  time_text: z.string().max(80).nullable(),
  format: z.string().max(120).nullable(),
  location: z.string().max(200).nullable(),
  speaker: z.string().max(200).nullable(),
  description: z.string().min(1, 'A short summary is required.').max(600),
  body: z.string().max(20000).nullable(),
  eligibility: z.string().max(200).nullable(),
  deadline: isoDate.nullable(),
  register_url: url.nullable(),
  details_url: url.nullable(),
  topics: z.string().max(100).nullable(),
  published: z.number()
});

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE = 4 * 1024 * 1024; // hosts like Vercel cap each request at 4.5 MB

/** Reads an uploaded image. Returns null when no file was chosen; throws a user-facing message if invalid. */
async function readImage(file: FormDataEntryValue | null): Promise<{ data: Uint8Array; mime: string } | null> {
  if (!file || typeof file === 'string' || file.size === 0) return null;
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Images must be JPG, PNG or WebP.');
  if (file.size > MAX_IMAGE) throw new Error('Each image must be 4 MB or smaller.');
  const data = new Uint8Array(await file.arrayBuffer());
  // Check the file's real signature, not just its declared type
  const sig = Array.from(data.slice(0, 12));
  const ok = (sig[0] === 0xff && sig[1] === 0xd8) || (sig[0] === 0x89 && sig[1] === 0x50 && sig[2] === 0x4e && sig[3] === 0x47) ||
    (String.fromCharCode(...sig.slice(0, 4)) === 'RIFF' && String.fromCharCode(...sig.slice(8, 12)) === 'WEBP');
  if (!ok) throw new Error('That file does not look like a valid image.');
  return { data, mime: file.type };
}

export async function saveEvent(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get('id')) || null;
  const target = id ? `/admin/events/${id}` : '/admin/events/new';
  const parsed = eventSchema.safeParse({
    kind: str(fd, 'kind') || 'workshop',
    title: str(fd, 'title'), date: str(fd, 'date'), date_text: optStr(fd, 'date_text'), time_text: optStr(fd, 'time_text'),
    format: optStr(fd, 'format'), location: optStr(fd, 'location'), speaker: optStr(fd, 'speaker'), description: str(fd, 'description'),
    body: optStr(fd, 'body'), eligibility: optStr(fd, 'eligibility'), deadline: optStr(fd, 'deadline'),
    register_url: optStr(fd, 'register_url'), details_url: optStr(fd, 'details_url'),
    topics: fd.getAll('topics').map(String).join(',') || null, published: flag(fd, 'published')
  });
  if (!parsed.success) back(target, { error: firstIssue(parsed.error) });

  let flyer: Awaited<ReturnType<typeof readImage>> = null;
  const photos: NonNullable<Awaited<ReturnType<typeof readImage>>>[] = [];
  try {
    flyer = await readImage(fd.get('image'));
    for (const f of fd.getAll('gallery')) { const img = await readImage(f); if (img) photos.push(img); }
  } catch (err) {
    back(target, { error: (err as Error).message });
  }

  // Photos ticked "Remove", and the 6-photo limit per event
  const keep = id ? await query<{ id: number }>('SELECT id FROM event_images WHERE event_id = ?', [id]) : [];
  const removeIds = fd.getAll('remove_photo').map(Number).filter((n) => keep.some((k) => Number(k.id) === n));
  if (keep.length - removeIds.length + photos.length > MAX_EVENT_PHOTOS) {
    back(target, { error: `An event can have up to ${MAX_EVENT_PHOTOS} photos. It has ${keep.length - removeIds.length}; you tried to add ${photos.length}. Remove some first.` });
  }

  const e = parsed.data!;
  const cols = ['kind', 'title', 'date', 'date_text', 'time_text', 'format', 'location', 'speaker', 'description', 'body', 'eligibility', 'deadline', 'register_url', 'details_url', 'topics', 'published'] as const;
  const vals = cols.map((c) => e[c]);
  let eventId = id;
  if (id) {
    await execute(`UPDATE events SET ${cols.map((c) => `${c} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ?`, [...vals, id]);
  } else {
    eventId = (await execute(`INSERT INTO events (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`, vals)).lastInsertId;
  }
  if (flyer) await execute("UPDATE events SET image = ?, image_type = ?, updated_at = datetime('now') WHERE id = ?", [flyer.data, flyer.mime, eventId]);
  else if (id && fd.get('remove_image') === 'on') await execute("UPDATE events SET image = NULL, image_type = NULL, updated_at = datetime('now') WHERE id = ?", [id]);
  for (const pid of removeIds) await execute('DELETE FROM event_images WHERE id = ? AND event_id = ?', [pid, id]);
  for (const [i, p] of photos.entries()) {
    await execute('INSERT INTO event_images (event_id, data, mime, sort_order) VALUES (?, ?, ?, (SELECT COALESCE(MAX(sort_order), 0) + ? FROM event_images WHERE event_id = ?))', [eventId, p.data, p.mime, i + 1, eventId]);
  }
  revalidatePath('/', 'layout');
  back('/admin/events', { saved: '1', tab: e.date >= todayEdmonton() ? 'current' : 'past' });
}

export async function deleteEvent(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get('id'));
  await execute('DELETE FROM event_images WHERE event_id = ?', [id]);
  await execute('DELETE FROM events WHERE id = ?', [id]);
  revalidatePath('/', 'layout');
  back('/admin/events', { deleted: '1' });
}

/* ---------- Stories ---------- */

const storySchema = z.object({
  name: z.string().min(1, 'Name is required.').max(120),
  location: z.string().max(120).nullable(),
  theme: z.string().min(1, 'Headline is required.').max(160),
  quote: z.string().min(1, 'The story text is required.').max(5000),
  tags: z.string().max(200).nullable(),
  categories: z.string().max(200).nullable(),
  lang: z.enum(['en', 'fr']),
  featured: z.number(),
  consent_confirmed: z.number(),
  published: z.number(),
  sort_order: z.number().int()
});

export async function saveStory(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get('id')) || null;
  const parsed = storySchema.safeParse({
    name: str(fd, 'name'), location: optStr(fd, 'location'), theme: str(fd, 'theme'), quote: str(fd, 'quote'),
    tags: optStr(fd, 'tags'), categories: fd.getAll('categories').map(String).join(' ') || null, lang: str(fd, 'lang') || 'en',
    featured: flag(fd, 'featured'), consent_confirmed: flag(fd, 'consent_confirmed'), published: flag(fd, 'published'),
    sort_order: Number(fd.get('sort_order')) || 0
  });
  const target = id ? `/admin/stories/${id}` : '/admin/stories/new';
  if (!parsed.success) back(target, { error: firstIssue(parsed.error) });
  const s = parsed.data!;
  if (s.published && !s.consent_confirmed) back(target, { error: 'Confirm the participant’s consent before publishing a story.' });
  const cols = ['name', 'location', 'theme', 'quote', 'tags', 'categories', 'lang', 'featured', 'consent_confirmed', 'published', 'sort_order'] as const;
  const vals = cols.map((c) => s[c]);
  if (id) await execute(`UPDATE stories SET ${cols.map((c) => `${c} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ?`, [...vals, id]);
  else await execute(`INSERT INTO stories (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`, vals);
  revalidatePath('/', 'layout');
  back('/admin/stories', { saved: '1' });
}

export async function deleteStory(fd: FormData) {
  await requireAdmin();
  await execute('DELETE FROM stories WHERE id = ?', [Number(fd.get('id'))]);
  revalidatePath('/', 'layout');
  back('/admin/stories', { deleted: '1' });
}

/* ---------- Videos ---------- */


export async function saveVideo(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get('id')) || null;
  const target = id ? `/admin/videos/${id}` : '/admin/videos/new';
  const youtubeId = parseYouTubeId(str(fd, 'youtube'));
  if (!youtubeId) back(target, { error: 'Paste a YouTube link (watch, youtu.be or shorts) or an 11-character video ID.' });
  const title = str(fd, 'title');
  if (!title) back(target, { error: 'Title is required.' });
  const placement = str(fd, 'placement') === 'about' ? 'about' : 'home';
  const vals = [youtubeId, title.slice(0, 200), optStr(fd, 'description'), optStr(fd, 'source_label'), flag(fd, 'is_short'), flag(fd, 'published'), Number(fd.get('sort_order')) || 0, placement];
  if (id) await execute("UPDATE videos SET youtube_id = ?, title = ?, description = ?, source_label = ?, is_short = ?, published = ?, sort_order = ?, placement = ?, updated_at = datetime('now') WHERE id = ?", [...vals, id]);
  else await execute('INSERT INTO videos (youtube_id, title, description, source_label, is_short, published, sort_order, placement) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', vals);
  revalidatePath('/', 'layout');
  back('/admin/videos', { saved: '1' });
}

export async function deleteVideo(fd: FormData) {
  await requireAdmin();
  await execute('DELETE FROM videos WHERE id = ?', [Number(fd.get('id'))]);
  revalidatePath('/', 'layout');
  back('/admin/videos', { deleted: '1' });
}

/* ---------- Account & admins ---------- */

export async function changePassword(fd: FormData) {
  const session = await requireAdmin();
  const current = String(fd.get('current') ?? '');
  const next = String(fd.get('next') ?? '');
  if (next.length < 12) back('/admin/account', { error: 'New password must be at least 12 characters.' });
  if (next !== String(fd.get('confirm') ?? '')) back('/admin/account', { error: 'The new passwords do not match.' });
  const admin = await queryOne<{ password_hash: string }>('SELECT password_hash FROM admins WHERE id = ?', [Number(session.sub)]);
  if (!admin || !(await checkPassword(current, admin.password_hash))) back('/admin/account', { error: 'Your current password is not correct.' });
  await execute('UPDATE admins SET password_hash = ? WHERE id = ?', [await hashPassword(next), Number(session.sub)]);
  back('/admin/account', { saved: 'password' });
}

export async function addAdmin(fd: FormData) {
  await requireAdmin();
  const parsed = z.object({
    name: z.string().min(1, 'Name is required.').max(120),
    email: z.string().email('Enter a valid email address.'),
    password: z.string().min(12, 'Temporary password must be at least 12 characters.')
  }).safeParse({ name: str(fd, 'name'), email: str(fd, 'email'), password: String(fd.get('password') ?? '') });
  if (!parsed.success) back('/admin/account', { error: firstIssue(parsed.error) });
  const { name, email, password } = parsed.data!;
  if (await queryOne('SELECT id FROM admins WHERE email = ?', [email])) back('/admin/account', { error: 'An admin with that email already exists.' });
  await execute('INSERT INTO admins (email, name, password_hash) VALUES (?, ?, ?)', [email, name, await hashPassword(password)]);
  back('/admin/account', { saved: 'admin' });
}

export async function removeAdmin(fd: FormData) {
  const session = await requireAdmin();
  const id = Number(fd.get('id'));
  if (id === Number(session.sub)) back('/admin/account', { error: 'You can’t remove your own account.' });
  await execute('DELETE FROM admins WHERE id = ?', [id]);
  back('/admin/account', { saved: 'removed' });
}

/* ---------- Website content ---------- */

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;
const SAFE_IMAGE = /^(\/images\/|\/media\/uploads\/\d+|https:\/\/)/i;

/** Cleans a submitted value against its field definition, falling back to `fallback` when invalid. */
function cleanField(field: Field, value: unknown, fallback: unknown, rejected: string[] = []): unknown {
  switch (field.type) {
    case 'lines':
      return Array.isArray(value) ? value.map((v) => String(v).trim().slice(0, 300)).filter(Boolean).slice(0, 40) : fallback;
    case 'group': {
      const v = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
      const fb = (fallback ?? {}) as Record<string, unknown>;
      return Object.fromEntries(field.fields.map((f) => [f.key, cleanField(f, v[f.key], fb[f.key], rejected)]));
    }
    case 'repeat': {
      const list = Array.isArray(value) ? value.slice(0, 40) : [];
      const fb = (Array.isArray(fallback) ? fallback : []) as Record<string, unknown>[];
      let items = list.map((item, i) => Object.fromEntries(field.fields.map((f) => [f.key, cleanField(f, (item as Record<string, unknown>)?.[f.key], fb[i]?.[f.key] ?? '', rejected)])));
      if (field.fixed) items = fb.map((d, i) => items[i] ?? d);
      return items;
    }
    default: {
      if (typeof value !== 'string') return fallback;
      const v = value.trim();
      const max = field.type === 'textarea' ? 20000 : 500;
      const reject = () => { rejected.push(field.label); return fallback; };
      if (field.type === 'url') return v === '' || SAFE_HREF.test(v) ? v.slice(0, max) : reject();
      if (field.type === 'image') return v === '' || SAFE_IMAGE.test(v) ? v.slice(0, max) : reject();
      if (field.type === 'email') return v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? v : reject();
      if (field.type === 'select') return field.options?.some(([o]) => o === v) ? v : fallback;
      return v.slice(0, max);
    }
  }
}

/** Sets obj[path] where path is like "heroImage" or "header.image". */
function setPath(obj: Record<string, unknown>, path: string, value: string) {
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts.slice(0, -1)) {
    if (!cur[p] || typeof cur[p] !== 'object') return;
    cur = cur[p] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

export type ContentState = { ok?: boolean; error?: string; warning?: string; values?: Record<string, unknown>; at?: number };

export async function saveContent(_: ContentState, fd: FormData): Promise<ContentState> {
  const session = await requireAdmin();
  const id = str(fd, 'section') as SectionId;
  const section = contentSections.find((s) => s.id === id);
  if (!section) return { error: 'Unknown section.' };

  let payload: Record<string, unknown> = {};
  try { payload = JSON.parse(String(fd.get('payload') ?? '{}')); } catch { return { error: 'Could not read the form. Please try again.' }; }

  const current = (await getContent())[id] as Record<string, unknown>;
  const rejected: string[] = [];
  const cleaned = Object.fromEntries(section.fields.map((f) => [f.key, cleanField(f, payload[f.key], current[f.key], rejected)])) as Record<string, unknown>;

  try {
    for (const [name, file] of fd.entries()) {
      if (!name.startsWith('upload:')) continue;
      const img = await readImage(file);
      if (!img) continue;
      const up = await execute('INSERT INTO uploads (data, mime, name) VALUES (?, ?, ?)', [img.data, img.mime, typeof file === 'string' ? null : file.name.slice(0, 200)]);
      setPath(cleaned, name.slice('upload:'.length), `/media/uploads/${up.lastInsertId}`);
    }
  } catch (err) {
    return { error: (err as Error).message };
  }

  await execute(
    `INSERT INTO site_content (section, value, updated_at, updated_by) VALUES (?, ?, datetime('now'), ?)
     ON CONFLICT(section) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by`,
    [id, JSON.stringify(cleaned), session.email]
  );
  revalidatePath('/', 'layout');
  const warning = rejected.length
    ? `These fields were not changed because the value is not valid (links must start with https://, / , mailto: or tel:): ${[...new Set(rejected)].join(', ')}.`
    : undefined;
  return { ok: true, values: cleaned, warning, at: Date.now() };
}

export async function resetContent(fd: FormData) {
  await requireAdmin();
  const id = str(fd, 'section');
  await execute('DELETE FROM site_content WHERE section = ?', [id]);
  revalidatePath('/', 'layout');
  back(`/admin/content/${id}`, { saved: 'reset' });
}
