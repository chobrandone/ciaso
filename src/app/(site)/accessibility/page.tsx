import PageHeader from '@/components/PageHeader';
import RichText from '@/components/RichText';
import { getContact, getContent } from '@/lib/content';
import { headerMetadata } from '@/lib/page-meta';

export const generateMetadata = () => headerMetadata('accessibility', '/accessibility');

export default async function AccessibilityPage() {
  const [{ accessibility }, contact] = await Promise.all([getContent(), getContact()]);
  return (
    <>
      <PageHeader crumb="Accessibility" header={accessibility.header} />
      <section className="section section--tight">
        <div className="container container--narrow">
          <RichText text={accessibility.body} />
          <p>Email <a href={`mailto:${contact.email}?subject=Website%20accessibility`}>{contact.email}</a>
            {contact.phones[0] && <> or call <a href={`tel:${contact.phones[0].tel}`}>{contact.phones[0].display}</a></>}.</p>
        </div>
      </section>
    </>
  );
}
