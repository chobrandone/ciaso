import 'server-only';
import { cache } from 'react';
import type { IconName } from '@/components/Icon';
import { query } from './db';
import { defaults, type Content, type SectionId } from './content-schema';

export type { Content } from './content-schema';

/** Structural parts that stay fixed (they drive URLs and the Get Support form). */
export const PILLAR_KEYS = ['settle', 'work', 'grow', 'belong', 'thrive'] as const;
export const PILLAR_ICONS: IconName[] = ['settle', 'work', 'grow', 'belong', 'thrive'];

/** Deep-merges saved values over defaults so new default fields still appear after an upgrade. */
function merge<T>(base: T, saved: unknown): T {
  if (saved === undefined || saved === null) return base;
  if (Array.isArray(base)) return (Array.isArray(saved) ? saved : base) as T;
  if (typeof base === 'object' && base !== null) {
    if (typeof saved !== 'object' || Array.isArray(saved)) return base;
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const k of Object.keys(out)) out[k] = merge(out[k], (saved as Record<string, unknown>)[k]);
    return out as T;
  }
  return (typeof saved === typeof base ? saved : base) as T;
}

/** All website content: defaults + whatever admins have saved. Cached per request. */
export const getContent = cache(async (): Promise<Content> => {
  const rows = await query<{ section: string; value: string }>('SELECT section, value FROM site_content');
  const out = structuredClone(defaults) as Content;
  for (const row of rows) {
    if (!(row.section in out)) continue;
    try {
      const id = row.section as SectionId;
      (out as Record<SectionId, unknown>)[id] = merge(out[id], JSON.parse(row.value));
    } catch { /* ignore a corrupt row and keep defaults */ }
  }
  return out;
});

export type Pillar = { key: (typeof PILLAR_KEYS)[number]; icon: IconName; name: string; items: string[] };

export async function getPillars(): Promise<Pillar[]> {
  const c = await getContent();
  return PILLAR_KEYS.map((key, i) => ({
    key,
    icon: PILLAR_ICONS[i],
    name: c.pillars.items[i]?.name || defaults.pillars.items[i].name,
    items: c.pillars.items[i]?.items ?? defaults.pillars.items[i].items
  }));
}

/** Contact details in the shape the components use. */
export async function getContact() {
  const c = (await getContent()).contact;
  const tel = (p: string) => '+1' + p.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  return {
    ...c,
    phones: [c.phone1, c.phone2].filter(Boolean).map((p) => ({ display: p, tel: tel(p) })),
    social: { linkedin: c.linkedin, facebook: c.facebook, youtube: c.youtube }
  };
}
export type ContactInfo = Awaited<ReturnType<typeof getContact>>;

export type NavLink = { label: string; href: string; hint?: string };
export type NavTab = NavLink & { children: NavLink[] };

const SAFE_LINK = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

/** The editable menu. Dropdown lines are "Label | /link | optional description"; unsafe links are dropped. */
export async function getNav(): Promise<{ tabs: NavTab[]; cta: NavLink }> {
  const { nav } = await getContent();
  const tabs = nav.items
    .filter((t) => t.label && SAFE_LINK.test(t.href || ''))
    .map((t) => ({
      label: t.label,
      href: t.href,
      children: (t.children ?? []).map((line) => {
        const [label = '', href = '', hint = ''] = line.split('|').map((s) => s.trim());
        return { label, href, hint: hint || undefined };
      }).filter((c) => c.label && SAFE_LINK.test(c.href))
    }));
  return { tabs, cta: { label: nav.ctaLabel || 'Get Support', href: SAFE_LINK.test(nav.ctaHref) ? nav.ctaHref : '/get-support' } };
}

/** next/image can only optimize files from /public; uploaded or external images are served as-is. */
export const isStaticImage = (src: string) => src.startsWith('/images/');
