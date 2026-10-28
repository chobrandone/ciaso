import Link from 'next/link';
import VideoForm from '../VideoForm';
import { Notice } from '../../ui';

export const metadata = { title: 'Add video' };

export default async function NewVideo({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  return (
    <>
      <p style={{ marginBottom: '1rem' }}><Link className="text-link" href="/admin/videos">← All videos</Link></p>
      <div className="admin-head"><h1>Add video</h1></div>
      <Notice params={sp} />
      <VideoForm />
    </>
  );
}
