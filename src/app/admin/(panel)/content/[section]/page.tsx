import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContentEditor from './ContentEditor';
import { ConfirmButton, Notice } from '../../ui';
import { getContent } from '@/lib/content';
import { sections, type SectionId } from '@/lib/content-schema';
import { queryOne } from '@/lib/db';
import { resetContent, saveContent } from '../../../actions';

export const metadata = { title: 'Edit content' };

export default async function EditContent({ params, searchParams }: { params: Promise<{ section: string }>; searchParams: Promise<Record<string, string>> }) {
  const [{ section: id }, sp] = await Promise.all([params, searchParams]);
  const section = sections.find((s) => s.id === id);
  if (!section) notFound();
  const values = (await getContent())[id as SectionId] as Record<string, unknown>;
  const edited = await queryOne<{ updated_at: string }>('SELECT updated_at FROM site_content WHERE section = ?', [id]);

  return (
    <>
      <p style={{ marginBottom: '1rem' }}><Link className="text-link" href="/admin/content">← Website content</Link></p>
      <div className="admin-head">
        <div><h1>{section.title}</h1>{section.description && <p>{section.description}</p>}</div>
        {section.preview && <a className="btn btn--secondary btn--sm" href={section.preview} target="_blank" rel="noopener">View on website ↗</a>}
      </div>
      <Notice params={sp} />
      <ContentEditor section={section} values={values} action={saveContent} />
      {edited && (
        <form action={resetContent} className="panel">
          <input type="hidden" name="section" value={section.id} />
          <h2>Restore original text</h2>
          <p className="note">Discards all changes to this section and goes back to the original website text.</p>
          <ConfirmButton message={`Restore the original text for “${section.title}”? Your changes will be lost.`}>Restore original</ConfirmButton>
        </form>
      )}
    </>
  );
}
