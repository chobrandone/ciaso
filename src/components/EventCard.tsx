import Link from 'next/link';
import Icon, { type IconName } from './Icon';
import type { EventRow } from '@/lib/data';
import { formatEventDate } from '@/lib/ui';

export const flyerUrl = (ev: Pick<EventRow, 'id' | 'updated_at'>) => `/media/events/${ev.id}?v=${encodeURIComponent(ev.updated_at)}`;

export default function EventCard({ ev, past = false }: { ev: EventRow; past?: boolean }) {
  const meta: [IconName, string][] = [];
  if (ev.time_text) meta.push(['clock', ev.time_text]);
  if (ev.format) meta.push(['video', ev.format]);
  if (ev.location) meta.push(['pin', ev.location]);
  if (ev.speaker) meta.push(['mentor', ev.speaker]);

  return (
    <article className={`event event--card${past ? ' event--past' : ''}`}>
      <div className="event__media">
        {ev.has_image || ev.cover_photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ev.has_image ? flyerUrl(ev) : `/media/event-images/${ev.cover_photo}`} alt="" loading="lazy" />
        ) : <span className="event__media-fallback"><Icon name="calendar" /></span>}
        {ev.photo_count > 0 && (
          <span className="event__photos"><Icon name="image" />{ev.photo_count} photo{ev.photo_count > 1 ? 's' : ''}</span>
        )}
        <span className={`event__kind event__kind--${ev.kind}`}>{ev.kind === 'workshop' ? 'Workshop' : 'Event'}</span>
      </div>
      <div className="event__body">
        <p className="event__date">
          <Icon name="calendar" />
          {past && <span className="visually-hidden">Past event: </span>}
          <time dateTime={ev.date}>{ev.date_text || formatEventDate(ev.date)}</time>
        </p>
        <h3><Link className="event__link" href={`/events/${ev.id}`}>{ev.title}</Link></h3>
        {meta.length > 0 && (
          <ul className="event__meta">
            {meta.map(([icon, text]) => <li key={icon + text}><Icon name={icon} /><span>{text}</span></li>)}
          </ul>
        )}
        <p>{ev.description}</p>
        <div className="event__actions">
          <span className="text-link" aria-hidden="true">{past ? (ev.photo_count > 0 ? 'See photos & recap' : 'Read more') : 'Details & registration'} <Icon name="arrow" /></span>
          {!past && ev.register_url && (
            <a className="btn btn--primary btn--sm event__register" href={ev.register_url} rel="noopener" target="_blank">
              Register<span className="visually-hidden"> for {ev.title} (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
