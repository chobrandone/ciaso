'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/** Thin red bar at the top of the screen while the next page loads (internal link clicks only). */
export default function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page / hash link
      setState('loading');
    };
    // Capture phase: runs before Next's <Link> handler cancels the default action
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  // Navigation finished
  useEffect(() => {
    setState((s) => (s === 'loading' ? 'done' : s));
  }, [pathname, search]);

  useEffect(() => {
    if (state !== 'done') return;
    const t = setTimeout(() => setState('idle'), 700);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <div className={`route-progress${state === 'loading' ? ' is-loading' : state === 'done' ? ' is-done' : ''}`} aria-hidden="true">
      <div className="route-progress__bar" />
    </div>
  );
}
