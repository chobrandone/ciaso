import Link from 'next/link';
import StoryForm from '../StoryForm';
import { Notice } from '../../ui';

export const metadata = { title: 'New story' };

export default async function NewStory({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  return (
    <>
      <p style={{ marginBottom: '1rem' }}><Link className="text-link" href="/admin/stories">← All stories</Link></p>
      <div className="admin-head"><h1>New story</h1></div>
      <Notice params={sp} />
      <StoryForm />
    </>
  );
}
