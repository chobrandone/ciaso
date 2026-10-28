import Link from 'next/link';
import Icon from '@/components/Icon';
import { query } from '@/lib/db';
import { EVENT_COLUMNS, todayEdmonton, type EventRow } from '@/lib/data';
import { formatEventDate } from '@/lib/ui';
import { Notice } from '../ui';

export const metadata = { title: 'Events' };

export default async function EventsAdmin({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const today = todayEdmonton();
  const tab = sp.tab === 'past' ? 'past' : 'current';
  const rows = await query<EventRow & { gallery: number }>(
    `SELECT ${EVENT_COLUMNS}, (SELECT COUNT(*) FROM event_images WHERE event_id = events.id) AS gallery FROM events
     WHERE date ${tab === 'past' ? '<' : '>='} ? ORDER BY date ${tab === 'past' ? 'DESC' : 'ASC'}, id`, [today]
  );
  const counts = await query<{ past: number; n: number }>('SELECT (date < ?) AS past, COUNT(*) AS n FROM events GROUP BY past', [today]);
  const count = (past: boolean) => Number(counts.find((c) => Number(c.past) === (past ? 1 : 0))?.n ?? 0);

  return (
    <>
      <div className="admin-head">
        <div><h1>Events &amp; workshops</h1><p>Upload current (upcoming) and past events. Events move from Current to Past automatically after their date.</p></div>
        <div className="btn-row">
          <Link className="btn btn--primary btn--sm" href="/admin/events/new"><Icon name="plus" />Add current event</Link>
          <Link className="btn btn--secondary btn--sm" href="/admin/events/new?past=1"><Icon name="plus" />Add past event</Link>
        </div>
      </div>
      <Notice params={sp} />
      <nav className="admin-tabs" aria-label="Event lists">
        <Link href="/admin/events?tab=current" aria-current={tab === 'current' ? 'page' : undefined}>Current events <span className="count">{count(false)}</span></Link>
        <Link href="/admin/events?tab=past" aria-current={tab === 'past' ? 'page' : undefined}>Past events <span className="count">{count(true)}</span></Link>
      </nav>
      <div className="panel">
        {rows.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th style={{ width: 84 }}>Flyer</th><th>Event</th><th>Date</th><th>Type</th><th>Visibility</th></tr></thead>
              <tbody>
                {rows.map((e) => (
                  <tr key={e.id}>
                    <td>
                      {e.has_image
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={`/media/events/${e.id}?v=${encodeURIComponent(e.updated_at)}`} alt="" width={64} height={64} style={{ objectFit: 'cover', borderRadius: 6 }} />
                        : <span className="pill pill--muted">None</span>}
                    </td>
                    <td><Link href={`/admin/events/${e.id}`}>{e.title}</Link><div className="muted">{[e.format, e.location, e.gallery ? `${e.gallery} photo${e.gallery > 1 ? 's' : ''}` : null].filter(Boolean).join(' · ')}</div></td>
                    <td className="muted">{e.date_text || formatEventDate(e.date)}</td>
                    <td><span className="pill pill--type">{e.kind === 'workshop' ? 'Workshop' : 'Event'}</span></td>
                    <td>{e.published ? <span className="pill pill--closed">Published</span> : <span className="pill pill--muted">Hidden</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="empty">{tab === 'current' ? 'No current events. Add one to show it on the website’s Current events page.' : 'No past events.'}</p>}
      </div>
    </>
  );
}
