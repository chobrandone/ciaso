import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon from '@/components/Icon';
import { query, queryOne } from '@/lib/db';
import type { SubmissionRow } from '@/lib/data';
import { labels } from '@/lib/validation';
import { deleteSubmission, updateSubmission } from '../../../actions';
import { ConfirmButton, Notice } from '../../ui';

export const metadata = { title: 'Enquiry' };

export default async function SubmissionDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const { id } = await params;
  const sp = await searchParams;
  const s = await queryOne<SubmissionRow>('SELECT * FROM submissions WHERE id = ?', [Number(id)]);
  if (!s) notFound();
  const emails = await query<{ id: number; kind: string; to_addr: string; subject: string; status: string; error: string | null; created_at: string }>(
    'SELECT * FROM email_log WHERE submission_id = ? ORDER BY id', [s.id]);

  const when = (d: string) => new Date(d + 'Z').toLocaleString('en-CA', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Edmonton' });
  const fields: [string, string | null][] = [
    ['Form', labels.type[s.type]],
    ['Name', s.name],
    ['Email', s.email],
    ['Phone', s.phone],
    ['Organization', s.organization],
    ['Topic', s.topic ? labels.topic[s.topic] ?? s.topic : null],
    ['Interests', s.interests],
    ['Preferred contact', s.contact_preference === 'phone' ? 'Phone call' : s.contact_preference === 'email' ? 'Email' : null],
    ['Received', when(s.created_at)],
    ['Message', s.message]
  ];
  const subject = encodeURIComponent(`Re: your ${labels.type[s.type].toLowerCase()} to CIASO`);

  return (
    <>
      <p style={{ marginBottom: '1rem' }}><Link className="text-link" href="/admin/submissions">← All enquiries</Link></p>
      <div className="admin-head">
        <div>
          <h1>{s.name}</h1>
          <p><span className={`pill pill--${s.status}`}>{labels.status[s.status]}</span> · {labels.type[s.type]} · #{s.id}</p>
        </div>
        <div className="btn-row">
          <a className="btn btn--primary btn--sm" href={`mailto:${s.email}?subject=${subject}`}><Icon name="mail" />Reply by email</a>
          {s.phone && <a className="btn btn--secondary btn--sm" href={`tel:${s.phone.replace(/[^\d+]/g, '')}`}><Icon name="phone" />Call</a>}
        </div>
      </div>
      <Notice params={sp} />
      <div className="admin-grid-2">
        <section className="panel" aria-labelledby="details-title">
          <h2 id="details-title">Details</h2>
          <dl className="detail">
            {fields.filter(([, v]) => v).map(([k, v]) => <div key={k} style={{ display: 'contents' }}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>
        </section>
        <div>
          <section className="panel" aria-labelledby="status-title">
            <h2 id="status-title">Follow-up</h2>
            <form action={updateSubmission} className="admin-form">
              <input type="hidden" name="id" value={s.id} />
              <div className="field">
                <label htmlFor="status">Status</label>
                <select className="select" id="status" name="status" defaultValue={s.status}>
                  {Object.entries(labels.status).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="field">
                <label htmlFor="notes">Internal notes <span className="optional">(staff only)</span></label>
                <textarea className="textarea" id="notes" name="notes" defaultValue={s.notes ?? ''} maxLength={5000} />
              </div>
              <div className="form-actions"><button className="btn btn--primary btn--sm" type="submit">Save</button></div>
            </form>
            {s.updated_at !== s.created_at && <p className="note" style={{ marginTop: '0.75rem', marginBottom: 0 }}>Last updated {when(s.updated_at)}</p>}
          </section>
          <section className="panel" aria-labelledby="emails-title">
            <h2 id="emails-title">Emails</h2>
            {emails.length ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                {emails.map((m) => (
                  <li key={m.id}>
                    <span className={`pill pill--${m.status === 'sent' ? 'closed' : m.status === 'failed' ? 'new' : 'muted'}`}>{m.status === 'sent' ? 'Sent' : m.status === 'failed' ? 'Failed' : 'Not sent'}</span>{' '}
                    <strong>{m.kind === 'autoreply' ? 'Automatic reply' : 'Notification to CIASO'}</strong>
                    <div className="note">To {m.to_addr} · {when(m.created_at)}</div>
                    {m.error && <div className="note">{m.error}</div>}
                  </li>
                ))}
              </ul>
            ) : <p className="note">No emails recorded for this enquiry.</p>}
          </section>
          <section className="panel">
            <h2>Delete</h2>
            <p className="note">Permanently removes this enquiry and its notes.</p>
            <form action={deleteSubmission}>
              <input type="hidden" name="id" value={s.id} />
              <ConfirmButton message={`Delete the enquiry from ${s.name}? This cannot be undone.`}>Delete enquiry</ConfirmButton>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
