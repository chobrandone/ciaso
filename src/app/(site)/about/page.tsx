import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import FinalCta from '@/components/FinalCta';
import Icon from '@/components/Icon';
import { Connector, InlineVideo, JourneyTimeline, Partners } from '@/components/Blocks';
import { getContent } from '@/lib/content';
import { headerMetadata } from '@/lib/page-meta';
import { delay } from '@/lib/ui';

export const generateMetadata = () => headerMetadata('about', '/about');

export default async function AboutPage() {
  const { about, brand, home, images } = await getContent();
  return (
    <>
      <PageHeader crumb="About" header={about.header}>
        <div className="btn-row">
          <Link className="btn btn--primary" href="/services">Our Services</Link>
          <Link className="btn btn--secondary" href="/contact?topic=partner">Partner With Us</Link>
        </div>
      </PageHeader>

      <section className="section" aria-labelledby="who-title">
        <div className="container split">
          <div className="reveal reveal--left">
            <p className="eyebrow">{home.introEyebrow}</p>
            <h2 id="who-title">{about.whoTitle}</h2>
            <p className="lead">{brand.statement}</p>
            {about.vision && <p>{about.vision}</p>}
            <h3 className="mini-heading">{home.whoWeHelpLabel}</h3>
            <ul className="chips" role="list">{brand.whoWeHelp.map((w) => <li key={w}>{w}</li>)}</ul>
          </div>
          <div className="reveal reveal--right">
            <InlineVideo placement="about" fallback={{ src: images.aboutImage, alt: images.aboutAlt, width: 800, height: 534 }} />
          </div>
        </div>
      </section>

      <section className="section section--surface" aria-labelledby="why-title">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">{about.whyEyebrow}</p>
            <h2 id="why-title">{about.whyTitle}</h2>
            {about.mission && <p>{about.mission}</p>}
          </div>
          <div className="prc">
            <div className="prc__item reveal"><p className="prc__label">The problem</p><p>{about.problem}</p></div>
            <div className="prc__item reveal" style={delay(0.12)}><p className="prc__label">The solution</p><p>{about.solution}</p></div>
            <div className="prc__item reveal" style={delay(0.24)}><p className="prc__label">The outcome</p><p>{about.outcome}</p></div>
          </div>
        </div>
      </section>

      <section className="section section--dark" aria-labelledby="journey-title">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow eyebrow--light">{home.journeyEyebrow}</p>
            <h2 id="journey-title">{about.journeyTitle}</h2>
          </div>
          <JourneyTimeline />
        </div>
      </section>

      <section className="section" aria-labelledby="connect-title">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">{home.connectorEyebrow}</p>
            <h2 id="connect-title">{about.connectTitle}</h2>
            <p>{brand.connector}</p>
          </div>
          <div className="connector--light"><Connector /></div>
          <div className="btn-row" style={{ marginTop: '2rem' }}>
            <Link className="btn btn--primary" href="/contact?topic=partner">Partner With Us</Link>
            <Link className="text-link" href="/contact?topic=donate">Donate <Icon name="arrow" /></Link>
          </div>
        </div>
      </section>

      <Partners surface />

      <FinalCta />
    </>
  );
}
