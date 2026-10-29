import Link from 'next/link';
import Image from 'next/image';
import Icon from './Icon';
import LanguageSwitch from './LanguageSwitch';
import { getContact, getContent, getPillars } from '@/lib/content';

export default async function Footer() {
  const [c, contact, pillars] = await Promise.all([getContent(), getContact(), getPillars()]);
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__about">
          <Link className="brand" href="/" aria-label="CIASO home">
            <Image src={c.images.logo} width={174} height={91} alt={`CIASO – ${contact.orgName}`} unoptimized={!c.images.logo.startsWith('/images/')} />
          </Link>
          <p>{c.footer.text}</p>
          <p className="site-footer__tagline">{c.brand.campaign.map((l, i) => <span key={i}>{i > 0 && <br />}{l}</span>)}</p>
          <ul className="social" aria-label="CIASO on social media">
            {contact.linkedin && <li><a href={contact.linkedin} rel="noopener" target="_blank"><Icon name="linkedin" /><span className="visually-hidden">CIASO on LinkedIn (opens in a new tab)</span></a></li>}
            {contact.facebook && <li><a href={contact.facebook} rel="noopener" target="_blank"><Icon name="facebook" /><span className="visually-hidden">CIASO on Facebook (opens in a new tab)</span></a></li>}
            {contact.youtube && <li><a href={contact.youtube} rel="noopener" target="_blank"><Icon name="youtube" /><span className="visually-hidden">CIASO on YouTube (opens in a new tab)</span></a></li>}
          </ul>
        </div>
        <nav className="site-footer__col" aria-label="About">
          <h2 className="site-footer__heading">About</h2>
          <ul>
            <li><Link href="/about">About CIASO</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/testimonial">Testimonial</Link></li>
            <li><Link href="/volunteer">Volunteer</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </nav>
        <nav className="site-footer__col" aria-label="Services">
          <h2 className="site-footer__heading">Services</h2>
          <ul>{pillars.map((p) => <li key={p.key}><Link href={`/services#${p.key}`}>{p.name}</Link></li>)}</ul>
        </nav>
        <nav className="site-footer__col" aria-label="Events">
          <h2 className="site-footer__heading">Events</h2>
          <ul>
            <li><Link href="/events">Current events</Link></li>
            <li><Link href="/events/past">Past events</Link></li>
            <li><Link href="/workshop">Workshop</Link></li>
            <li><Link href="/get-support">Get Support</Link></li>
          </ul>
        </nav>
        <div className="site-footer__col site-footer__contact">
          <h2 className="site-footer__heading">Contact</h2>
          <address>
            <p><Icon name="pin" /><a href={contact.mapUrl || undefined} rel="noopener" target="_blank">{contact.street}<br />{contact.city}, {contact.region} {contact.postal}<span className="visually-hidden"> (map opens in a new tab)</span></a></p>
            {contact.phones.length > 0 && <p><Icon name="phone" /><span>{contact.phones.map((p, i) => <span key={p.tel}>{i > 0 && <br />}<a href={`tel:${p.tel}`}>{p.display}</a></span>)}</span></p>}
            <p><Icon name="mail" /><a href={`mailto:${contact.email}`}>{contact.email}</a></p>
          </address>
        </div>
      </div>
      <div className="site-footer__bottom">
        <div className="container site-footer__bottom-inner">
          <p>© {new Date().getFullYear()} {c.footer.copyright}</p>
          <ul>
            <li><Link href="/accessibility">Accessibility</Link></li>
            <li><LanguageSwitch /></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
