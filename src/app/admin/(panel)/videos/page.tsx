import Image from 'next/image';
import Link from 'next/link';
import Icon from '@/components/Icon';
import { query } from '@/lib/db';
import type { VideoRow } from '@/lib/data';
import { Notice } from '../ui';

export const metadata = { title: 'Videos' };

export default async function VideosAdmin({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const rows = await query<VideoRow>('SELECT * FROM videos ORDER BY sort_order ASC, id ASC');
  return (
    <>
      <div className="admin-head">
        <div><h1>Videos</h1><p>CIASO YouTube videos, shown inside the Home or About page content. Paste any YouTube link to add one.</p></div>
        <Link className="btn btn--primary btn--sm" href="/admin/videos/new"><Icon name="plus" />Add video</Link>
      </div>
      <Notice params={sp} />
      <div className="panel">
        {rows.length ? (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th style={{ width: 140 }}>Preview</th><th>Video</th><th>Order</th><th>Visibility</th></tr></thead>
              <tbody>
                {rows.map((v) => (
                  <tr key={v.id}>
                    <td><Image src={`https://i.ytimg.com/vi/${v.youtube_id}/mqdefault.jpg`} alt="" width={128} height={72} style={{ borderRadius: 6 }} /></td>
                    <td><Link href={`/admin/videos/${v.id}`}>{v.title}</Link><div className="muted">{v.placement === 'about' ? 'About page' : 'Home page'}{v.is_short ? ' · Short' : ''}{v.source_label ? ` · ${v.source_label}` : ''} · <a href={`https://www.youtube.com/watch?v=${v.youtube_id}`} target="_blank" rel="noopener">Open on YouTube ↗</a></div></td>
                    <td className="muted">{v.sort_order}</td>
                    <td>{v.published ? <span className="pill pill--closed">Published</span> : <span className="pill pill--muted">Hidden</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="empty">No videos yet.</p>}
      </div>
    </>
  );
}
