import PageHeader from '@/components/PageHeader';
import FinalCta from '@/components/FinalCta';
import { EventGrid, EventTabs, NoCurrentEvents } from '@/components/EventList';
import { getCurrentEvents } from '@/lib/data';
import { getContent } from '@/lib/content';
import { headerMetadata } from '@/lib/page-meta';

export const generateMetadata = () => headerMetadata('events', '/events');

export default async function EventsPage() {
  const [events, { events: text }] = await Promise.all([getCurrentEvents(), getContent()]);
  return (
    <>
      <PageHeader crumb="Events" header={text.header} />
      <EventTabs active="current" />
      <section className="section" aria-label="Current events">
        <div className="container">
          <h2 className="visually-hidden">Upcoming events and workshops</h2>
          {events.length ? <EventGrid events={events} /> : <NoCurrentEvents />}
        </div>
      </section>
      <FinalCta />
    </>
  );
}
