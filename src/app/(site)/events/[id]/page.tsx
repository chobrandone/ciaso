import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon, { type IconName } from '@/components/Icon';
import RichText from '@/components/RichText';
import ShareBar from '@/components/ShareBar';
import { flyerUrl } from '@/components/EventCard';
import { getEvent, getEventGallery, todayEdmonton } from '@/lib/data';
import { site } from '@/lib/site';
import { delay, formatEventDate } from '@/lib/ui';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ev = await getEvent(Number((await params).id));
  if (!ev) return { title: 'Event not found' };
  return {
    title: ev.title,
    description: ev.description,
    alternates: { canonical: `/events/${ev.id}` },
    openGraph: ev.has_image ? { images: [{ url: flyerUrl(ev) }] } : undefined
  };
}

export default async function EventDetail({ params }: Props) {
  const ev = await getEvent(Number((await params).id));
  if (!ev) notFound();
  const gallery = await getEventGallery(ev.id);
  const past = ev.date < todayEdmonton();
  const when = ev.date_text || formatEventDate(ev.date);
  const facts: [IconName, string, string][] = [
    ['calendar', 'Date', when],
    ...(ev.time_text ? [['clock', 'Time', ev.time_text] as [IconName, string, string]] : []),
    ...(ev.format ? [['video', 'Format', ev.format] as [IconName, string, string]] : []),
    ...(ev.location ? [['pin', 'Location', ev.location] as [IconName, string, string]] : []),
    ...(ev.speaker ? [['mentor', ev.speaker.includes('&') ? 'Speakers' : 'Speaker', ev.speaker] as [IconName, string, string]] : []),
    ...(ev.eligibility ? [['belong', 'Who can attend', ev.eligibility] as [IconName, string, string]] : []),
    ...(!past && ev.deadline ? [['alert', 'Register by', formatEventDate(ev.deadline)] as [IconName, string, string]] : [])
  ];
  const ld = {
    '@context': 'https://schema.org', '@type': 'Event', name: ev.title, startDate: ev.date, description: ev.description,
    eventAttendanceMode: /online|zoom|virtual/i.test(ev.format ?? '') ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
    location: ev.location ? { '@type': 'Place', name: ev.location, address: ev.location } : { '@type': 'VirtualLocation', url: `${site.url}/events/${ev.id}` },
    organizer: { '@type': 'Organization', name: 'Canada Integration and Settlement Organization (CIASO)', url: site.url },
    ...(ev.has_image ? { image: `${site.url}${flyerUrl(ev)}` } : {})
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="page-header page-header--event" aria-labelledby="page-title">
        {ev.has_image && (
          <div className="page-header__bg" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={flyerUrl(ev)} alt="" />
          </div>
        )}
        <div className="container">
          <nav className="breadcrumbs anim-in" aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link></li>
              <li><Link href={past ? '/events/past' : '/events'}>{past ? 'Past events' : 'Events'}</Link></li>
              <li><span aria-current="page">{ev.title}</span></li>
            </ol>
          </nav>
          <p className="eyebrow anim-up">{ev.kind === 'workshop' ? 'Workshop' : 'Event'} · {past ? 'Past event' : 'Upcoming'}</p>
          <h1 id="page-title" className="anim-up" style={delay(0.1)}>{ev.title}</h1>
          <p className="page-header__lead anim-up" style={delay(0.2)}>{ev.description}</p>
          {!past && ev.register_url && (
            <div className="page-header__actions anim-up" style={delay(0.3)}>
              <a className="btn btn--primary" href={ev.register_url} rel="noopener" target="_blank">Register now<span className="visually-hidden"> (opens in a new tab)</span></a>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container event-detail">
          <div className="event-detail__main reveal">
            {ev.body ? <RichText text={ev.body} /> : <p className="lead">{ev.description}</p>}
            {gallery.length > 0 && (
              <>
                <h2 className="event-detail__gallery-title">Photos &amp; flyers</h2>
                <ul className="gallery" role="list">
                  {gallery.map((g) => (
                    <li key={g.id}>
                      <a href={`/media/event-images/${g.id}`} target="_blank" rel="noopener">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={`/media/event-images/${g.id}`} alt={g.caption ?? `Photo from ${ev.title}`} loading="lazy" />
                        <span className="visually-hidden">(opens full size in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div style={{ marginTop: '2.5rem' }}><ShareBar url={`${site.url}/events/${ev.id}`} label="Share this event:" /></div>
          </div>

          <aside className="event-detail__side reveal reveal--right" aria-label="Event details">
            {ev.has_image && (
              <a className="event-detail__flyer" href={flyerUrl(ev)} target="_blank" rel="noopener">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={flyerUrl(ev)} alt={`Event flyer: ${ev.title}`} />
                <span className="visually-hidden">(opens full size in a new tab)</span>
              </a>
            )}
            <dl className="event-facts">
              {facts.map(([icon, label, value]) => (
                <div key={label}><dt><Icon name={icon} />{label}</dt><dd>{value}</dd></div>
              ))}
            </dl>
            {!past && ev.register_url && <a className="btn btn--primary btn--block" href={ev.register_url} rel="noopener" target="_blank">Register now<span className="visually-hidden"> (opens in a new tab)</span></a>}
            {past && <p className="note">This event has ended. <Link href="/events">See current events</Link>.</p>}
            <p className="note">Questions? Call <a href="tel:+15878135155">587-813-5155</a> or email <a href="mailto:admin@ciaso.ca">admin@ciaso.ca</a>.</p>          </aside>
        </div>
      </section>
    </>
  );
}
