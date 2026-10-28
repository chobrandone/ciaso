import Link from 'next/link';
import EventCard from './EventCard';
import Icon from './Icon';
import type { EventRow } from '@/lib/data';
import { getContact, getContent } from '@/lib/content';
import { delay } from '@/lib/ui';

export function EventGrid({ events, past = false }: { events: EventRow[]; past?: boolean }) {
  return (
    <div className="events">
      {events.map((e, i) => <div key={e.id} className="reveal" style={delay((i % 3) * 0.08)}><EventCard ev={e} past={past} /></div>)}
    </div>
  );
}

export async function NoCurrentEvents({ pastHref = '/events/past' }: { pastHref?: string }) {
  const [{ events }, contact] = await Promise.all([getContent(), getContact()]);
  return (
    <div className="empty-state reveal">
      <Icon name="calendar" />
      <h3>{events.emptyTitle}</h3>
      <p>{events.emptyText}</p>
      <div className="btn-row">
        <Link className="btn btn--secondary btn--sm" href={pastHref}>See past events</Link>
        <Link className="text-link" href="/contact?topic=events">Ask about upcoming events <Icon name="arrow" /></Link>
        {contact.linkedin && <a className="text-link" href={contact.linkedin} rel="noopener" target="_blank">LinkedIn<span className="visually-hidden"> (opens in a new tab)</span></a>}
        {contact.facebook && <a className="text-link" href={contact.facebook} rel="noopener" target="_blank">Facebook<span className="visually-hidden"> (opens in a new tab)</span></a>}
      </div>
    </div>
  );
}

/** Current / Past switcher shown under the events page header. */
export function EventTabs({ active }: { active: 'current' | 'past' }) {
  return (
    <nav className="event-tabs" aria-label="Event lists">
      <div className="container">
        <Link href="/events" aria-current={active === 'current' ? 'page' : undefined}>Current events</Link>
        <Link href="/events/past" aria-current={active === 'past' ? 'page' : undefined}>Past events</Link>
        <Link href="/workshop">Workshops</Link>
      </div>
    </nav>
  );
}
