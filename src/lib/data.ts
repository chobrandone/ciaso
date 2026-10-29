import 'server-only';
import { query, queryOne } from './db';

export type EventKind = 'event' | 'workshop';
export type EventRow = {
  id: number; kind: EventKind; title: string; date: string; date_text: string | null; time_text: string | null; format: string | null;
  location: string | null; speaker: string | null; description: string; body: string | null; eligibility: string | null; deadline: string | null;
  register_url: string | null; details_url: string | null; topics: string | null; published: number; has_image: number; updated_at: string;
  recap: string | null; recap_body: string | null; linkedin_url: string | null; facebook_url: string | null;
  photo_count: number; cover_photo: number | null;
};
export type StoryRow = {
  id: number; name: string; location: string | null; theme: string; quote: string; tags: string | null;
  categories: string | null; lang: string; featured: number; consent_confirmed: number; published: number; sort_order: number;
};
export type VideoRow = {
  id: number; youtube_id: string; title: string; description: string | null; source_label: string | null;
  is_short: number; published: number; sort_order: number; placement: string;
};
export type SubmissionRow = {
  id: number; type: string; name: string; email: string; phone: string | null; organization: string | null;
  topic: string | null; interests: string | null; contact_preference: string | null; message: string | null;
  status: string; notes: string | null; created_at: string; updated_at: string;
};

/** Every event column except the image bytes, plus a has_image flag and its gallery photo count / first photo. */
export const EVENT_COLUMNS = `id, kind, title, date, date_text, time_text, format, location, speaker, description, body, eligibility, deadline,
  register_url, details_url, topics, published, created_at, updated_at, recap, recap_body, linkedin_url, facebook_url,
  (image IS NOT NULL) AS has_image,
  (SELECT COUNT(*) FROM event_images g WHERE g.event_id = events.id) AS photo_count,
  (SELECT g.id FROM event_images g WHERE g.event_id = events.id ORDER BY g.sort_order, g.id LIMIT 1) AS cover_photo`;

/** Today's date in Edmonton (YYYY-MM-DD), so events move to "past" on local time. */
export function todayEdmonton(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Edmonton', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

const kindFilter = (kind?: EventKind) => (kind ? ' AND kind = ?' : '');
const kindArg = (kind?: EventKind) => (kind ? [kind] : []);

export const getCurrentEvents = (limit = 50, kind?: EventKind) =>
  query<EventRow>(`SELECT ${EVENT_COLUMNS} FROM events WHERE published = 1 AND date >= ?${kindFilter(kind)} ORDER BY date ASC, id ASC LIMIT ?`,
    [todayEdmonton(), ...kindArg(kind), limit]);

export const getPastEvents = (limit = 100, kind?: EventKind) =>
  query<EventRow>(`SELECT ${EVENT_COLUMNS} FROM events WHERE published = 1 AND date < ?${kindFilter(kind)} ORDER BY date DESC, id ASC LIMIT ?`,
    [todayEdmonton(), ...kindArg(kind), limit]);

export const getEvent = (id: number) =>
  queryOne<EventRow>(`SELECT ${EVENT_COLUMNS} FROM events WHERE id = ? AND published = 1`, [id]);

export const getEventGallery = (eventId: number) =>
  query<{ id: number; caption: string | null }>('SELECT id, caption FROM event_images WHERE event_id = ? ORDER BY sort_order, id', [eventId]);

export const getStories = (limit = 100) =>
  query<StoryRow>('SELECT * FROM stories WHERE published = 1 ORDER BY featured DESC, sort_order ASC, id ASC LIMIT ?', [limit]);

export const getVideos = (placement?: 'home' | 'about') =>
  query<VideoRow>(`SELECT * FROM videos WHERE published = 1${placement ? ' AND placement = ?' : ''} ORDER BY sort_order ASC, id ASC`, placement ? [placement] : []);
