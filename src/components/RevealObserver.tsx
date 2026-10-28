'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Adds `is-visible` to `.reveal` elements as they scroll into view.
 * Content is only hidden (via the `reveal-on` class) once this has run,
 * so pages stay fully visible if JavaScript is unavailable.
 */
export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.classList.remove('reveal-on');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      }),
      { rootMargin: '0px 0px -8% 0px' }
    );
    const observe = () => document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => io.observe(el));
    observe();
    root.classList.add('reveal-on');
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [pathname]);

  return null;
}
