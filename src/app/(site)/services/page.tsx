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

      {/* All services on one structured panel: one row per pillar */}
      <section className="section" aria-labelledby="services-title">
        <div className="container">
          <div className="section-head reveal">
            <p className="eyebrow">{c.home.pillarsEyebrow}</p>
            <h2 id="services-title">{c.home.pillarsTitle}</h2>
            {c.pillars.intro && <p>{c.pillars.intro}</p>}
          </div>
          <ol className="service-table" role="list">
            {pillars.map((p, i) => (
              <li key={p.key} id={p.key} className="service-table__row reveal" style={delay(i * 0.06)}>
                <div className="service-table__pillar">
                  <span className="pillar__icon"><Icon name={p.icon} /></span>
                  <div>
                    <span className="service-table__num">0{i + 1}</span>
                    <h3>{p.name}</h3>
                  </div>
                </div>
                <ul className="service-table__items" aria-label={`${p.name} services`}>
                  {p.items.map((item) => <li key={item}><Icon name="check" />{item}</li>)}
                </ul>
                <Link className="service-table__cta text-link" href={`/get-support?need=${p.key}`}>
                  Get help<span className="visually-hidden"> with {p.name}</span> <Icon name="arrow" />
                </Link>
              </li>
            ))}
          </ol>
          <p className="note" style={{ marginTop: '1.25rem' }}>Not sure which service fits? <Link href="/get-support">Tell us what you need</Link> and we’ll guide you.</p>
        </div>
      </section>

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
