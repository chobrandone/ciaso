import Link from 'next/link';
import Icon from '@/components/Icon';
import { query, queryOne } from '@/lib/db';
import { todayEdmonton, type SubmissionRow } from '@/lib/data';
import { labels } from '@/lib/validation';
import { formatEventDate } from '@/lib/ui';

export const metadata = { title: 'Dashboard' };

const plural = { support: 'Support requests', contact: 'Contact messages', volunteer: 'Volunteer applications', partner: 'Partnership enquiries' };

export default async function Dashboard() {
  const counts = await query<{ type: string; total: number; fresh: number }>(
    "SELECT type, COUNT(*) AS total, SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS fresh FROM submissions GROUP BY type"
  );
  const byType = Object.fromEntries(counts.map((c) => [c.type, c]));
  const recent = await query<SubmissionRow>('SELECT * FROM submissions ORDER BY created_at DESC, id DESC LIMIT 8');
  const today = todayEdmonton();
  const upcoming = await query<{ id: number; title: string; date: string }>('SELECT id, title, date FROM events WHERE published = 1 AND date >= ? ORDER BY date LIMIT 5', [today]);
  const content = await queryOne<{ events: number; stories: number; videos: number }>(
    'SELECT (SELECT COUNT(*) FROM events) AS events, (SELECT COUNT(*) FROM stories WHERE published = 1) AS stories, (SELECT COUNT(*) FROM videos WHERE published = 1) AS videos'
  );
  const lastWeek = await queryOne<{ n: number }>("SELECT COUNT(*) AS n FROM submissions WHERE created_at >= datetime('now', '-7 days')");

  return (
    <>
      <div className="admin-head">
        <div><h1>Dashboard</h1><p>{Number(lastWeek?.n ?? 0)} new enquiries in the last 7 days.</p></div>
        <Link className="btn btn--primary btn--sm" href="/admin/events/new"><Icon name="plus" />Add event</Link>
      </div>

      <div className="stats">
        {(['support', 'contact', 'volunteer', 'partner'] as const).map((t) => (
          <Link key={t} className="stat" href={`/admin/submissions?type=${t}`}>
            <span className="stat__label"><Icon name="inbox" />{plural[t]}</span>
            <span className="stat__value">{Number(byType[t]?.total ?? 0)}</span>
            <span className="stat__sub"><strong>{Number(byType[t]?.fresh ?? 0)}</strong> awaiting response</span>
          </Link>
        ))}
      </div>

      <div className="admin-grid-2">
        <section className="panel" aria-labelledby="recent-title">
          <div className="admin-head" style={{ marginBottom: '0.75rem' }}>
            <h2 id="recent-title" style={{ margin: 0 }}>Latest enquiries</h2>
            <Link className="text-link" href="/admin/submissions">View all <Icon name="arrow" /></Link>
          </div>
          {recent.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Received</th></tr></thead>
                <tbody>
                  {recent.map((s) => (
                    <tr key={s.id}>
                      <td><Link href={`/admin/submissions/${s.id}`}>{s.name}</Link><div className="muted">{s.topic ? labels.topic[s.topic] ?? s.topic : s.email}</div></td>
                      <td><span className="pill pill--type">{labels.type[s.type]}</span></td>
                      <td><span className={`pill pill--${s.status}`}>{labels.status[s.status]}</span></td>
                      <td className="muted">{new Date(s.created_at + 'Z').toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Edmonton' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="empty">No enquiries yet. Submissions from the website’s forms will appear here.</p>}
        </section>

        <div>
          <section className="panel" aria-labelledby="upcoming-title">
            <h2 id="upcoming-title">Upcoming events</h2>
            {upcoming.length ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                {upcoming.map((e) => <li key={e.id}><Link href={`/admin/events/${e.id}`}>{e.title}</Link><div className="note">{formatEventDate(e.date)}</div></li>)}
              </ul>
            ) : <p className="note">No upcoming events. The website shows a “new workshops are being planned” message.</p>}
            <p style={{ marginTop: '1rem', marginBottom: 0 }}><Link className="btn btn--secondary btn--sm" href="/admin/events/new"><Icon name="plus" />Add event</Link></p>
          </section>
          <section className="panel" aria-labelledby="content-title">
            <h2 id="content-title">Website content</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
              <li><Link href="/admin/events">{Number(content?.events ?? 0)} events</Link> <span className="note">(upcoming and past)</span></li>
              <li><Link href="/admin/stories">{Number(content?.stories ?? 0)} published stories</Link></li>
              <li><Link href="/admin/videos">{Number(content?.videos ?? 0)} published videos</Link></li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
