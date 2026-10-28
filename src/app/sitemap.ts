import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = ['', '/about', '/faq', '/testimonial', '/services', '/volunteer', '/workshop', '/events', '/events/past', '/contact', '/get-support', '/accessibility'];
  const events = await query<{ id: number; updated_at: string }>('SELECT id, updated_at FROM events WHERE published = 1');
  return [
    ...paths.map((p) => ({ url: `${site.url}${p}`, lastModified: new Date(), changeFrequency: (p.startsWith('/events') || p === '/workshop' ? 'weekly' : 'monthly') as 'weekly' | 'monthly', priority: p === '' ? 1 : 0.7 })),
    ...events.map((e) => ({ url: `${site.url}/events/${e.id}`, lastModified: new Date(e.updated_at + 'Z'), priority: 0.5 }))
  ];
}
