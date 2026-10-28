import Link from 'next/link';
import { notFound } from 'next/navigation';
import VideoForm from '../VideoForm';
import { Notice } from '../../ui';
import { queryOne } from '@/lib/db';
import type { VideoRow } from '@/lib/data';

export const metadata = { title: 'Edit video' };

export default async function EditVideo({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const video = await queryOne<VideoRow>('SELECT * FROM videos WHERE id = ?', [Number(id)]);
  if (!video) notFound();
  return (
    <>
      <p style={{ marginBottom: '1rem' }}><Link className="text-link" href="/admin/videos">← All videos</Link></p>
      <div className="admin-head"><h1>Edit video</h1></div>
      <Notice params={sp} />
      <VideoForm video={video} />
    </>
  );
}
