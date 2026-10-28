import 'server-only';
import type { Metadata } from 'next';
import { getContent } from './content';
import type { SectionId } from './content-schema';

/** Builds page metadata from the editable header (title + search description). */
export async function headerMetadata(section: SectionId, path: string, key: 'header' | 'pastHeader' = 'header'): Promise<Metadata> {
  const c = (await getContent())[section] as unknown as Record<string, { title: string; seoDescription: string; image: string }>;
  const h = c[key];
  return {
    title: h.title,
    description: h.seoDescription,
    alternates: { canonical: path },
    openGraph: { title: h.title, description: h.seoDescription }
  };
}
