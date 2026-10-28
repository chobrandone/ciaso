import Link from 'next/link';
import EventForm from '../EventForm';
import { Notice } from '../../ui';

export const metadata = { title: 'New event' };

export default async function NewEvent({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const sp = await searchParams;
  const past = sp.past === '1';
  return (
    <>
      <p style={{ marginBottom: '1rem' }}><Link className="text-link" href={`/admin/events?tab=${past ? 'past' : 'current'}`}>← All events</Link></p>
      <div className="admin-head"><h1>{past ? 'Add a past event' : 'Add a current event'}</h1></div>
      <Notice params={sp} />
      <EventForm past={past} />
    </>
  );
}
