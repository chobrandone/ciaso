import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import FinalCta from '@/components/FinalCta';
import Icon from '@/components/Icon';
import { JourneyTimeline } from '@/components/Blocks';
import { getContent, getPillars } from '@/lib/content';
import { headerMetadata } from '@/lib/page-meta';
import { delay } from '@/lib/ui';

export const generateMetadata = () => headerMetadata('services', '/services');

export default async function ServicesPage() {
  const [c, pillars] = await Promise.all([getContent(), getPillars()]);
  return (
    <>
      <PageHeader crumb="Services" header={c.services.header}>
        <div className="btn-row"><Link className="btn btn--primary" href="/get-support">Get Support</Link></div>
      </PageHeader>

      <nav className="pillar-nav" aria-label="Service pillars">
        <div className="container">
          <ul>
            {pillars.map((p) => <li key={p.key}><a href={`#${p.key}`}><Icon name={p.icon} />{p.name}</a></li>)}
            <li><a href="#journey"><Icon name="arrow" />Journey</a></li>
          </ul>
        </div>
      </nav>

      {c.pillars.intro && <div className="container"><p className="lead" style={{ marginTop: '2rem' }}>{c.pillars.intro}</p></div>}

      {pillars.map((p, i) => (
        <section key={p.key} className="pillar-section" id={p.key} aria-labelledby={`${p.key}-title`}>
          <div className="container pillar-row">
            <div className="reveal reveal--left">
              <span className="pillar__icon pillar__icon--lg"><Icon name={p.icon} /></span>
              <p className="eyebrow">0{i + 1}</p>
              <h2 id={`${p.key}-title`}>{p.name}</h2>
            </div>
            <ul className="service-list" role="list">
              {p.items.map((item, j) => <li key={item} className="reveal" style={delay(j * 0.06)}><Icon name="check" />{item}</li>)}
            </ul>
            <div className="reveal">
              <Link className="btn btn--secondary btn--sm" href={`/get-support?need=${p.key}`}>Get help with {p.name.toLowerCase()}</Link>
            </div>
          </div>
        </section>
      ))}

      <section className="section section--dark" id="journey" aria-labelledby="journey-title">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow eyebrow--light">{c.home.journeyEyebrow}</p>
            <h2 id="journey-title">{c.home.journeyTitle}</h2>
            {c.journey.note && <p>{c.journey.note}</p>}
          </div>
          <JourneyTimeline />
        </div>
      </section>

      <FinalCta />
    </>
  );
}
