import Link from 'next/link';
import { notFound } from 'next/navigation';
import EventForm from '../EventForm';
import { Notice } from '../../ui';
import { query, queryOne } from '@/lib/db';
import { EVENT_COLUMNS, todayEdmonton, type EventRow } from '@/lib/data';

export const metadata = { title: 'Edit event' };

export default async function EditEvent({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const ev = await queryOne<EventRow>(`SELECT ${EVENT_COLUMNS} FROM events WHERE id = ?`, [Number(id)]);
  if (!ev) notFound();
  const gallery = await query<{ id: number; caption: string | null }>('SELECT id, caption FROM event_images WHERE event_id = ? ORDER BY sort_order, id', [ev.id]);
  const tab = ev.date < todayEdmonton() ? 'past' : 'current';
  return (
    <>
      <p style={{ marginBottom: '1rem' }}><Link className="text-link" href={`/admin/events?tab=${tab}`}>← {tab === 'past' ? 'Past' : 'Current'} events</Link></p>
      <div className="admin-head"><h1>Edit event</h1></div>
      <Notice params={sp} />
      <EventForm ev={ev} gallery={gallery} />
    </>
  );
}
