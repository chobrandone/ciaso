'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import LanguageSwitch from './LanguageSwitch';
import type { NavLink, NavTab } from '@/lib/content';

export type HeaderContact = { email: string; hours: string; phone: { display: string; tel: string } | null };

export default function Header({ contact, nav, logo }: { contact: HeaderContact; nav: { tabs: NavTab[]; cta: NavLink }; logo: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // mobile panel
  const [menu, setMenu] = useState<string | null>(null); // open dropdown
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const isActive = (item: NavTab) => {
    const paths = [item.href, ...item.children.map((c) => c.href.split('#')[0])].filter((p) => p.startsWith('/'));
    return item.href === '/' ? pathname === '/' : paths.some((p) => p !== '/' && (pathname === p || pathname.startsWith(p + '/')));
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menus on navigation
  useEffect(() => { setOpen(false); setMenu(null); }, [pathname]);

  // Close a dropdown on Escape or click outside
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.getElementById(`nav-btn-${menu}`)?.focus();
        setMenu(null);
      }
    };
    const onClick = (e: MouseEvent) => { if (!headerRef.current?.contains(e.target as Node)) setMenu(null); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('click', onClick); };
  }, [menu]);

  // Mobile panel
  useEffect(() => {
    document.body.classList.toggle('nav-open', open);
    if (!open) return;
    const top = headerRef.current?.getBoundingClientRect().bottom ?? 0;
    panelRef.current?.style.setProperty('--nav-top', `${Math.max(top, 0)}px`);
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !menu) { setOpen(false); toggleRef.current?.focus(); } };
    const mq = window.matchMedia('(min-width: 1200px)');
    const onMq = () => mq.matches && setOpen(false);
    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => { document.removeEventListener('keydown', onKey); mq.removeEventListener('change', onMq); };
  }, [open, menu]);

  // Hover opens dropdowns on devices with a real pointer
  const hoverable = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (min-width: 1200px)').matches;

  return (
    <>
      <a className="skip-link" href="#main">Skip to main content</a>
      <section className="topbar" aria-label="Contact information">
        <div className="container topbar__inner">
          <ul className="topbar__contact" aria-label="Contact CIASO">
            {contact.phone && <li><a href={`tel:${contact.phone.tel}`}><Icon name="phone" />{contact.phone.display}</a></li>}
            <li><a href={`mailto:${contact.email}`}><Icon name="mail" />{contact.email}</a></li>
            {contact.hours && <li className="topbar__hours"><Icon name="clock" />{contact.hours}</li>}
          </ul>
          <ul className="topbar__links" aria-label="Language">
            <li><LanguageSwitch /></li>
          </ul>
        </div>
      </section>
      <header ref={headerRef} className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="container site-header__inner">
          <Link className="brand" href="/" aria-label="CIASO – Canada Integration and Settlement Organization, home">
            <Image src={logo} width={174} height={91} alt="CIASO – Canada Integration and Settlement Organization" priority unoptimized={!logo.startsWith('/images/')} />
          </Link>
          <nav ref={panelRef} id="primary-nav" className={`primary-nav${open ? ' is-open' : ''}`} aria-label="Main">
            <ul className="primary-nav__list">
              {nav.tabs.map((item, idx) => {
                const active = isActive(item);
                if (!item.children.length) {
                  return (
                    <li key={item.href}>
                      <Link href={item.href} aria-current={active ? 'page' : undefined}>{item.label}</Link>
                    </li>
                  );
                }
                const key = `m${idx}`;
                const expanded = menu === key;
                return (
                  <li key={item.href} className={`has-menu${expanded ? ' is-open' : ''}`}
                    onMouseEnter={() => hoverable() && setMenu(key)} onMouseLeave={() => hoverable() && setMenu(null)}>
                    <button id={`nav-btn-${key}`} type="button" className={`menu-btn${active ? ' is-active' : ''}`}
                      aria-expanded={expanded} aria-controls={`nav-menu-${key}`} onClick={() => setMenu(expanded ? null : key)}>
                      {item.label}
                      <svg className="menu-btn__caret" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                    </button>
                    <ul id={`nav-menu-${key}`} className="dropdown" hidden={!expanded}>
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} aria-current={pathname === c.href ? 'page' : undefined}>
                            <span className="dropdown__label">{c.label}</span>
                            {c.hint && <span className="dropdown__hint">{c.hint}</span>}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
            <div className="primary-nav__mobile-extra">
              <Link className="btn btn--primary btn--block" href={nav.cta.href}>{nav.cta.label}</Link>
              <p className="primary-nav__contact">
                {contact.phone && <><a href={`tel:${contact.phone.tel}`}>{contact.phone.display}</a><br /></>}
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </p>
              <LanguageSwitch className="lang-switch--mobile" />
            </div>
          </nav>
          <div className="site-header__actions">
            <Link className="btn btn--primary site-header__cta" href={nav.cta.href} aria-current={pathname === nav.cta.href ? 'page' : undefined}>{nav.cta.label}</Link>
            <button ref={toggleRef} className="nav-toggle" type="button" aria-controls="primary-nav" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              <Icon name="menu" className="nav-toggle__open" />
              <Icon name="close" className="nav-toggle__close" />
              <span className="nav-toggle__label">{open ? 'Close' : 'Menu'}</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
