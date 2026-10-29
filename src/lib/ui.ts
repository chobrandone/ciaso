import type { CSSProperties } from 'react';

/** Animation/transition delay for `.anim-up` and `.reveal` elements. */
export const delay = (seconds: number) => ({ '--d': `${seconds}s` }) as CSSProperties;

export function formatEventDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-CA', {
    weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
  });
}

/** Photos an event can have in its gallery. */
export const MAX_EVENT_PHOTOS = 6;
