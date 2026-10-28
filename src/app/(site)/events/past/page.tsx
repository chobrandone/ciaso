import PageHeader from '@/components/PageHeader';
import { EventGrid, EventTabs } from '@/components/EventList';
import { getPastEvents } from '@/lib/data';
import { getContent } from '@/lib/content';
import { headerMetadata } from '@/lib/page-meta';

export const generateMetadata = () => headerMetadata('events', '/events/past', 'pastHeader');

export default async function PastEventsPage() {
  const [events, { events: text }] = await Promise.all([getPastEvents(), getContent()]);
  return (
    <>
      <PageHeader crumb="Past events" header={text.pastHeader} />
      <EventTabs active="past" />
      <section className="section" aria-label="Past events">
        <div className="container">
          <h2 className="visually-hidden">All past events and workshops</h2>
          {events.length ? <EventGrid events={events} past /> : <p className="lead">No past events yet.</p>}
        </div>
      </section>
    </>
  );
}
