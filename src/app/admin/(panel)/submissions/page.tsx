import Link from 'next/link';
import Icon from '@/components/Icon';
import { query, queryOne } from '@/lib/db';
import type { SubmissionRow } from '@/lib/data';
import { labels } from '@/lib/validation';
import { Notice } from '../ui';
import { buildSubmissionFilter, type SubmissionSearch } from '@/lib/submission-filter';

export const metadata = { title: 'Enquiries' };
const PAGE = 25;

type Search = SubmissionSearch;

export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const { sql, args } = buildSubmissionFilter(sp);
  const total = Number((await queryOne<{ n: number }>(`SELECT COUNT(*) AS n FROM submissions ${sql}`, args))?.n ?? 0);
  const rows = await query<SubmissionRow>(`SELECT * FROM submissions ${sql} ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`, [...args, PAGE, (page - 1) * PAGE]);
  const qs = (extra: Record<string, string | number>) => {
    const p = new URLSearchParams();
    for (const k of ['type', 'status', 'q'] as const) if (sp[k]) p.set(k, sp[k]!);
    for (const [k, v] of Object.entries(extra)) p.set(k, String(v));
    return p.toString();
  };

  return (
    <>
      <div className="admin-head">
        <div><h1>Enquiries</h1><p>Messages from the Get Support, Contact, Volunteer and Partnership forms.</p></div>
        <a className="btn btn--secondary btn--sm" href={`/admin/submissions/export?${qs({})}`}><Icon name="download" />Export CSV</a>
      </div>
      <Notice params={sp} />
      <div className="panel">
        <form className="toolbar" role="search" aria-label="Filter enquiries">
          <div className="field">
            <label htmlFor="f-type">Form</label>
            <select className="select" id="f-type" name="type" defaultValue={sp.type ?? ''}>
              <option value="">All forms</option>
              {Object.entries(labels.type).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-status">Status</label>
            <select className="select" id="f-status" name="status" defaultValue={sp.status ?? ''}>
              <option value="">Any status</option>
              {Object.entries(labels.status).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 200 }}>
            <label htmlFor="f-q">Search</label>
            <input className="input" id="f-q" name="q" type="search" defaultValue={sp.q ?? ''} placeholder="Name, email, organization or message" />
          </div>
          <button className="btn btn--primary btn--sm" type="submit">Apply</button>
          {(sp.type || sp.status || sp.q) && <Link className="text-link" href="/admin/submissions">Clear</Link>}
        </form>

        {rows.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Name</th><th>Form</th><th>Topic</th><th>Status</th><th>Received</th></tr></thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td><Link href={`/admin/submissions/${s.id}`}>{s.name}</Link><div className="muted">{s.organization ? `${s.organization} · ` : ''}{s.email}</div></td>
                    <td><span className="pill pill--type">{labels.type[s.type]}</span></td>
                    <td className="muted">{s.topic ? labels.topic[s.topic] ?? s.topic : s.interests ?? '—'}</td>
                    <td><span className={`pill pill--${s.status}`}>{labels.status[s.status]}</span></td>
                    <td className="muted">{new Date(s.created_at + 'Z').toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Edmonton' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="empty">No enquiries match these filters.</p>}

        <div className="pager">
          <span>{total} {total === 1 ? 'enquiry' : 'enquiries'}</span>
          <span className="btn-row">
            {page > 1 && <Link className="btn btn--secondary btn--sm" href={`/admin/submissions?${qs({ page: page - 1 })}`}>← Newer</Link>}
            {page * PAGE < total && <Link className="btn btn--secondary btn--sm" href={`/admin/submissions?${qs({ page: page + 1 })}`}>Older →</Link>}
          </span>
        </div>
      </div>
    </>
  );
}
