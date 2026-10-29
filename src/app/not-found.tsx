import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getContact, getContent, getNav } from '@/lib/content';

export const metadata = { title: 'Page not found', robots: { index: false } };

export default async function NotFound() {
  const [contact, nav, { images }] = await Promise.all([getContact(), getNav(), getContent()]);
  return (
    <>
      <Header contact={{ email: contact.email, hours: contact.hours, phone: contact.phones[0] ?? null }} nav={nav} logo={images.logo} />
      <main id="main" tabIndex={-1}>
        <section className="not-found">
          <div className="container container--narrow">
            <p className="not-found__code anim-up">404</p>
            <h1 className="anim-up" style={{ fontSize: 'var(--fs-h2)' }}>We couldn’t find that page.</h1>
            <p className="lead">The page may have moved as part of our new website. Here are some good places to start:</p>
            <div className="btn-row" style={{ justifyContent: 'center' }}>
              <Link className="btn btn--primary" href="/get-support">Get Support</Link>
              <Link className="btn btn--secondary" href="/programs">Our Programs</Link>
              <Link className="btn btn--secondary" href="/">Home</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
