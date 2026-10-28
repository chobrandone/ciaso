import Link from 'next/link';
import { notFound } from 'next/navigation';
import StoryForm from '../StoryForm';
import { Notice } from '../../ui';
import { queryOne } from '@/lib/db';
import type { StoryRow } from '@/lib/data';

export const metadata = { title: 'Edit story' };

export default async function EditStory({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const story = await queryOne<StoryRow>('SELECT * FROM stories WHERE id = ?', [Number(id)]);
  if (!story) notFound();
  return (
    <>
      <p style={{ marginBottom: '1rem' }}><Link className="text-link" href="/admin/stories">← All stories</Link></p>
      <div className="admin-head"><h1>Edit story</h1></div>
      <Notice params={sp} />
      <StoryForm story={story} />
    </>
  );
}
