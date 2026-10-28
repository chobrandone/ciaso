import Image from 'next/image';
import Link from 'next/link';
import Icon from '@/components/Icon';
import FinalCta from '@/components/FinalCta';
import StoryCard from '@/components/StoryCard';
import EventCard from '@/components/EventCard';
import { Connector, InlineVideo, JourneyTimeline, Partners, PillarGrid } from '@/components/Blocks';
import { getCurrentEvents, getPastEvents, getStories } from '@/lib/data';
import { getContact, getContent, getPillars } from '@/lib/content';
import type { Metadata } from 'next';
import { site } from '@/lib/site';
import { delay } from '@/lib/ui';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { home } = await getContent();
  return { title: { absolute: home.seoTitle }, description: home.seoDescription, alternates: { canonical: '/' } };
}

const orgJsonLdBase = {
  '@context': 'https://schema.org',
  '@type': 'NGO',
  name: 'Canada Integration and Settlement Organization (CIASO)',
  alternateName: 'CIASO',
  url: `${site.url}/`,
  areaServed: 'Alberta, Canada'
};

export default async function HomePage() {
  const [stories, current, c, contact, pillars] = await Promise.all([getStories(3), getCurrentEvents(3), getContent(), getContact(), getPillars()]);
  const recent = current.length ? [] : await getPastEvents(3);
  const { brand, home } = c;
  const marquee = [...brand.campaign, brand.summary, brand.hashtag].filter(Boolean);
  const orgJsonLd = {
    ...orgJsonLdBase,
    name: `${contact.orgName} (CIASO)`,
    logo: c.images.logo.startsWith('/') ? `${site.url}${c.images.logo}` : c.images.logo,
    email: contact.email,
    ...(contact.phones[0] ? { telephone: contact.phones[0].tel } : {}),
    address: { '@type': 'PostalAddress', streetAddress: contact.street, addressLocality: contact.city, addressRegion: contact.region, postalCode: contact.postal, addressCountry: 'CA' },
    sameAs: [contact.facebook, contact.linkedin, contact.youtube].filter(Boolean)
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />

      {/* Hero */}
      <section className="hero-v2" aria-labelledby="hero-title">
        <div className="hero-v2__bg" aria-hidden="true">
          <Image src={home.heroImage} alt="" fill priority sizes="100vw" quality={70} unoptimized={!home.heroImage.startsWith('/images/')} />
        </div>
        <div className="container hero-v2__grid">
          <div>
            <p className="eyebrow anim-up">{home.heroEyebrow}</p>
            <h1 id="hero-title" className="hero-v2__title">
              <span className="line anim-up" style={delay(0.1)}>{home.heroLine1}</span>
              <span className="line anim-up" style={delay(0.22)}>{home.heroLine2}</span>
              <span className="line accent anim-up" style={delay(0.34)}>{home.heroAccent}</span>
            </h1>
            <p className="hero-v2__lead anim-up" style={delay(0.5)}>{brand.promise}</p>
            <div className="btn-row anim-up" style={delay(0.62)}>
              <Link className="btn btn--primary" href="/get-support">Get Support</Link>
              <Link className="btn btn--secondary" href="/services">Explore Our Services</Link>
              <Link className="text-link" href="/about">Learn About CIASO <Icon name="arrow" /></Link>
            </div>
          </div>
          <div className="hero-v2__panel glass">
            <h2>{home.panelTitle}</h2>
            <p>{brand.summary}</p>
            <ul className="quick-links">
              {pillars.map((p) => (
                <li key={p.key}>
                  <Link className="quick-link" href={`/get-support?need=${p.key}`}>
                    <span className="quick-link__icon"><Icon name={p.icon} /></span>
                    <span><span className="quick-link__name">{p.name.toUpperCase()}</span><span className="quick-link__text">{p.items.slice(0, 3).join(' · ')}</span></span>
                    <Icon name="arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <span className="scroll-cue" aria-hidden="true" />
      </section>

      <div className="marquee" role="presentation">
        <div className="marquee__track">
          {[0, 1].map((g) => (
            <div key={g} className="marquee__group" aria-hidden={g === 1 ? 'true' : undefined}>
              {[...marquee, ...marquee].map((t, i) => (
                <span key={i} style={{ display: 'contents' }}>
                  <span className={i % 2 ? 'alt' : undefined}>{t}</span>
                  <span className="marquee__dot" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Who we are + who we help, with CIASO's video in the content */}
      <section className="section" aria-labelledby="intro-title">
        <div className="container split">
          <div className="reveal reveal--left">
            <p className="eyebrow">{home.introEyebrow}</p>
            <h2 id="intro-title">{brand.whoWeAre}</h2>
            <p className="lead">{brand.statement}</p>
            <h3 className="mini-heading">{home.whoWeHelpLabel}</h3>
            <ul className="chips" role="list">{brand.whoWeHelp.map((w) => <li key={w}>{w}</li>)}</ul>
            <div className="btn-row" style={{ marginTop: '1.75rem' }}>
              <Link className="btn btn--secondary" href="/about">About CIASO</Link>
            </div>
          </div>
          <div className="reveal reveal--right">
            <InlineVideo placement="home" fallback={{ src: c.images.homeIntroImage, alt: c.images.homeIntroAlt, width: 1024, height: 683 }} />
          </div>
        </div>
      </section>

      {/* How we help */}
      <section className="section section--surface" aria-labelledby="pillars-title">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">{home.pillarsEyebrow}</p>
            <h2 id="pillars-title">{home.pillarsTitle}</h2>
            <p>{brand.summary}</p>
          </div>
          <PillarGrid />
        </div>
      </section>

      {/* Journey */}
      <section className="section section--dark" aria-labelledby="journey-title">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow eyebrow--light">{home.journeyEyebrow}</p>
            <h2 id="journey-title">{home.journeyTitle}</h2>
          </div>
          <JourneyTimeline />
          <div className="btn-row" style={{ marginTop: '2.5rem' }}>
            <Link className="btn btn--light" href="/get-support">Find Your Starting Point</Link>
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="section" aria-labelledby="stories-title">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">{brand.hashtag}</p>
            <h2 id="stories-title">{home.storiesTitle}</h2>
          </div>
          <div className="stories">
            {stories.map((s) => <StoryCard key={s.id} story={s} wide={!!s.featured} className="reveal" maxChars={s.featured ? 420 : 220} />)}
          </div>
          <div className="btn-row" style={{ marginTop: '2rem' }}><Link className="btn btn--secondary" href="/testimonial">Read More Testimonials</Link></div>
        </div>
      </section>

      {/* Community connector */}
      <section className="section section--dark" aria-labelledby="connect-title">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow eyebrow--light">{home.connectorEyebrow}</p>
            <h2 id="connect-title">{home.connectorTitle}</h2>
            <p>{brand.connector}</p>
          </div>
          <Connector />
          <div className="btn-row" style={{ marginTop: '2.5rem' }}>
            <Link className="btn btn--primary" href="/contact?topic=partner">Partner With Us</Link>
            <Link className="btn btn--ghost-light" href="/volunteer">Volunteer</Link>
          </div>
        </div>
      </section>

      <Partners />

      {/* Events */}
      <section className="section section--surface" aria-labelledby="events-title">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">{home.eventsEyebrow}</p>
            <h2 id="events-title">{current.length ? home.eventsTitleUpcoming : home.eventsTitleRecent}</h2>
            {!current.length && home.eventsTextRecent && <p>{home.eventsTextRecent}</p>}
          </div>
          <div className="events">{(current.length ? current : recent).map((e) => <div key={e.id} className="reveal"><EventCard ev={e} past={!current.length} /></div>)}</div>
          <div className="btn-row" style={{ marginTop: '2rem' }}>
            <Link className="btn btn--secondary" href="/events">Current Events</Link>
            <Link className="text-link" href="/events/past">Past events <Icon name="arrow" /></Link>
          </div>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
