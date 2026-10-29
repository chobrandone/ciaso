import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Icon, { type IconName } from '@/components/Icon';
import RichText from '@/components/RichText';
import ShareBar from '@/components/ShareBar';
import PhotoGallery from '@/components/PhotoGallery';
import { flyerUrl } from '@/components/EventCard';
import { getEvent, getEventGallery, todayEdmonton } from '@/lib/data';
import { site } from '@/lib/site';
import { MAX_EVENT_PHOTOS, delay, formatEventDate } from '@/lib/ui';

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
  const photos = gallery.slice(0, MAX_EVENT_PHOTOS).map((g, i) => ({ src: `/media/event-images/${g.id}`, alt: g.caption ?? `Photo ${i + 1} from ${ev.title}` }));
  const hasRecap = past && !!(ev.recap || ev.recap_body);
  const social = [
    ev.linkedin_url && { href: ev.linkedin_url, label: 'Read the full post on LinkedIn', icon: 'linkedin' as const },
    ev.facebook_url && { href: ev.facebook_url, label: 'See the full post on Facebook', icon: 'facebook' as const }
  ].filter(Boolean) as { href: string; label: string; icon: IconName }[];
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
          <p className="page-header__lead anim-up" style={delay(0.2)}>{(past && ev.recap) || ev.description}</p>
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
            {hasRecap ? (
              <section aria-labelledby="recap-title">
                <p className="eyebrow">Event recap</p>
                <h2 id="recap-title" className="event-detail__section-title">How it went</h2>
                {ev.recap && <p className="lead">{ev.recap}</p>}
                {ev.recap_body && <RichText text={ev.recap_body} />}
              </section>
            ) : ev.body ? <RichText text={ev.body} /> : <p className="lead">{ev.description}</p>}

            {photos.length > 0 && (
              <section aria-labelledby="photos-title">
                <h2 id="photos-title" className="event-detail__section-title event-detail__section-title--spaced">{past ? 'Photos from the event' : 'Photos & flyers'}</h2>
                <PhotoGallery photos={photos} />
              </section>
            )}

            {social.length > 0 && (
              <div className="event-social">
                <p className="event-social__label">{past ? 'Read the full story' : 'Follow this event'}</p>
                <div className="btn-row">
                  {social.map((l) => (
                    <a key={l.href} className={`btn btn--secondary event-social__btn event-social__btn--${l.icon}`} href={l.href} rel="noopener" target="_blank">
                      <Icon name={l.icon} />{l.label}<span className="visually-hidden"> (opens in a new tab)</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {hasRecap && ev.body && (
              <details className="event-announcement">
                <summary>About this event (original announcement)</summary>
                <RichText text={ev.body} />
              </details>
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
