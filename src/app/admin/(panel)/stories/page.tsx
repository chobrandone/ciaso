import Link from 'next/link';
import Icon from '@/components/Icon';
import { query } from '@/lib/db';
import type { StoryRow } from '@/lib/data';
import { Notice } from '../ui';

export const metadata = { title: 'Stories' };

export default async function StoriesAdmin({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const rows = await query<StoryRow>('SELECT * FROM stories ORDER BY featured DESC, sort_order ASC, id ASC');
  return (
    <>
      <div className="admin-head">
        <div><h1>Success stories</h1><p>Testimonials shown on the home page (first 4) and the #FromHereToThrive page. Only publish with the participant’s consent.</p></div>
        <Link className="btn btn--primary btn--sm" href="/admin/stories/new"><Icon name="plus" />Add story</Link>
      </div>
      <Notice params={sp} />
      <div className="panel">
        {rows.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Story</th><th>Order</th><th>Consent</th><th>Visibility</th></tr></thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td><Link href={`/admin/stories/${s.id}`}>{s.name}</Link>{s.featured ? <> <span className="pill pill--new">Featured</span></> : null}<div className="muted">{s.theme}</div></td>
                    <td className="muted">{s.sort_order}</td>
                    <td>{s.consent_confirmed ? <span className="pill pill--closed">Confirmed</span> : <span className="pill pill--in_progress">Not recorded</span>}</td>
                    <td>{s.published ? <span className="pill pill--closed">Published</span> : <span className="pill pill--muted">Hidden</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="empty">No stories yet.</p>}
      </div>
    </>
  );
}
