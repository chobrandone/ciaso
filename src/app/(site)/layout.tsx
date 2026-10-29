import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PageLoader from '@/components/PageLoader';
import RevealObserver from '@/components/RevealObserver';
import RouteProgress from '@/components/RouteProgress';
import { Suspense } from 'react';
import { getContact, getContent, getNav } from '@/lib/content';

// Content is edited in the admin, so pages always render with the latest database values.
export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [contact, nav, { images }] = await Promise.all([getContact(), getNav(), getContent()]);
  return (
    <>
      <PageLoader logo={images.logo} />
      <Suspense fallback={null}><RouteProgress /></Suspense>
      <Header contact={{ email: contact.email, hours: contact.hours, phone: contact.phones[0] ?? null }} nav={nav} logo={images.logo} />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer />
      <RevealObserver />
    </>
  );
}
