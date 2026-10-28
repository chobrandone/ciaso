import Image from 'next/image';
import Link from 'next/link';
import Icon from './Icon';
import VideoEmbed from './VideoEmbed';
import { getContent, getPillars } from '@/lib/content';
import { ICON_OPTIONS } from '@/lib/content-schema';
import type { IconName } from './Icon';
import { getVideos } from '@/lib/data';
import { delay } from '@/lib/ui';

/** The five CIASO pillars with their services, from the brand document. */
export async function PillarGrid({ linkTo = '/services' }: { linkTo?: string }) {
  const pillars = await getPillars();
  return (
    <ul className="pillars" role="list">
      {pillars.map((p, i) => (
        <li key={p.key} className="pillar reveal" style={delay(i * 0.08)}>
          <span className="pillar__icon"><Icon name={p.icon} /></span>
          <p className="pillar__name">{p.name.toUpperCase()}</p>
          <ul className="pillar__items">{p.items.map((it) => <li key={it}>{it}</li>)}</ul>
          <Link className="text-link" href={`${linkTo}#${p.key}`}>Explore {p.name} <Icon name="arrow" /></Link>
        </li>
      ))}
    </ul>
  );
}

/** DISCOVER → CONNECT → EQUIP → WORK → GROW → THRIVE */
export async function JourneyTimeline() {
  const { journey } = await getContent();
  return (
    <ol className="journey journey--horizontal reveal">
      {journey.steps.map(({ name, text }, i) => (
        <li key={name} className="journey__step">
          <span className="journey__num" aria-hidden="true">0{i + 1}</span>
          <div><p className="journey__name">{name}</p><p className="journey__text">{text}</p></div>
        </li>
      ))}
    </ol>
  );
}

/** CIASO + partner → outcome */
const iconOk = (i: string): IconName => (ICON_OPTIONS.some(([v]) => v === i) ? i : 'community') as IconName;

export async function Connector() {
  const { connector } = await getContent();
  return (
    <ul className="connector" role="list">
      {connector.items.map((c, i) => (
        <li key={i} className="connector__item reveal" style={delay(i * 0.06)}>
          <Icon name={iconOk(c.icon)} />
          <h3><span className="connector__plus">CIASO +</span> {c.partner}</h3>
          {c.outcome && <p><span className="arrow" aria-hidden="true">→ </span>{c.outcome}</p>}
        </li>
      ))}
    </ul>
  );
}

/** CIASO's YouTube video(s) for a page, placed inside the page content (no separate section). */
export async function InlineVideo({ placement, fallback }: { placement: 'home' | 'about'; fallback: { src: string; alt: string; width: number; height: number } }) {
  const videos = await getVideos(placement);
  if (!videos.length) {
    return <div className="media-frame"><Image src={fallback.src} width={fallback.width} height={fallback.height} sizes="(min-width: 900px) 45vw, 100vw" alt={fallback.alt} unoptimized={!fallback.src.startsWith('/images/')} /></div>;
  }
  return (
    <div className="inline-videos">
      {videos.map((v) => (
        <figure key={v.id} className={`inline-video${v.is_short ? ' inline-video--short' : ''}`}>
          <VideoEmbed id={v.youtube_id} title={v.title} short={!!v.is_short} />
          <figcaption>
            <strong>{v.title}</strong>
            {v.source_label && <span>{v.source_label}</span>}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/** Partner logos (managed in Admin → Website content → Partner logos). Renders nothing when hidden or empty. */
export async function Partners({ surface = false }: { surface?: boolean }) {
  const { partners } = await getContent();
  const items = partners.items.filter((p) => p.logo);
  if (partners.show === 'no' || !items.length) return null;
  return (
    <section className={`section${surface ? ' section--surface' : ''}`} aria-labelledby="partners-title">
      <div className="container">
        <div className="section-head reveal">
          {partners.eyebrow && <p className="eyebrow">{partners.eyebrow}</p>}
          <h2 id="partners-title">{partners.title}</h2>
          {partners.text && <p>{partners.text}</p>}
        </div>
        <ul className="logos" role="list">
          {items.map((p, i) => {
            // eslint-disable-next-line @next/next/no-img-element
            const img = <img src={p.logo} alt={p.name} loading="lazy" />;
            return (
              <li key={i} className="reveal reveal--zoom" style={delay(i * 0.06)}>
                {p.url ? <a href={p.url} rel="noopener" target="_blank" title={p.name}>{img}<span className="visually-hidden"> (opens in a new tab)</span></a> : img}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
