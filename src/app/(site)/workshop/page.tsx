import PageHeader from '@/components/PageHeader';
import FinalCta from '@/components/FinalCta';
import { EventGrid, NoCurrentEvents } from '@/components/EventList';
import { getCurrentEvents, getPastEvents } from '@/lib/data';
import { getContent } from '@/lib/content';
import { headerMetadata } from '@/lib/page-meta';

export const generateMetadata = () => headerMetadata('workshop', '/workshop');

export default async function WorkshopPage() {
  const [upcoming, past, { workshop }] = await Promise.all([getCurrentEvents(50, 'workshop'), getPastEvents(100, 'workshop'), getContent()]);
  return (
    <>
      <PageHeader crumb="Workshop" header={workshop.header} />
      <section className="section" aria-labelledby="upcoming-title">
        <div className="container">
          <div className="section-head reveal"><p className="eyebrow">Upcoming</p><h2 id="upcoming-title">{workshop.upcomingTitle}</h2></div>
          {upcoming.length ? <EventGrid events={upcoming} /> : <NoCurrentEvents />}
        </div>
      </section>
      <section className="section section--surface" aria-labelledby="past-title">
        <div className="container">
          <div className="section-head reveal"><p className="eyebrow">Past workshops</p><h2 id="past-title">{workshop.pastTitle}</h2></div>
          <EventGrid events={past} past />
        </div>
      </section>
      <FinalCta />
    </>
  );
}
