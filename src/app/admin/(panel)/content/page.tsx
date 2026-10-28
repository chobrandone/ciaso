import Link from 'next/link';
import Icon from '@/components/Icon';
import { query } from '@/lib/db';
import { sections } from '@/lib/content-schema';
import { Notice } from '../ui';

export const metadata = { title: 'Website content' };

export default async function ContentIndex({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const rows = await query<{ section: string; updated_at: string; updated_by: string | null }>('SELECT section, updated_at, updated_by FROM site_content');
  const saved = Object.fromEntries(rows.map((r) => [r.section, r]));
  const groups = [...new Set(sections.map((s) => s.group))];
  const when = (d: string) => new Date(d + 'Z').toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Edmonton' });

  return (
    <>
      <div className="admin-head">
        <div>
          <h1>Website content</h1>
          <p>Edit every text, list and header image on the public website. Events, testimonials and videos have their own sections in the menu.</p>
        </div>
      </div>
      <Notice params={sp} />
      {groups.map((g) => (
        <section key={g} className="panel" aria-labelledby={`g-${g}`}>
          <h2 id={`g-${g}`}>{g}</h2>
          <ul className="content-list" role="list">
            {sections.filter((s) => s.group === g).map((s) => (
              <li key={s.id}>
                <Link href={`/admin/content/${s.id}`}>
                  <span>
                    <strong>{s.title}</strong>
                    {s.description && <span className="muted">{s.description}</span>}
                  </span>
                  <span className="muted content-list__meta">
                    {saved[s.id] ? <>Edited {when(saved[s.id].updated_at)}{saved[s.id].updated_by ? ` by ${saved[s.id].updated_by}` : ''}</> : 'Default text'}
                  </span>
                  <Icon name="arrow" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
