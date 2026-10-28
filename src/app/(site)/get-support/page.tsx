import PageHeader from '@/components/PageHeader';
import SupportFlow from '@/components/SupportFlow';
import { getContact, getContent, getPillars } from '@/lib/content';
import { headerMetadata } from '@/lib/page-meta';

export const generateMetadata = () => headerMetadata('getSupport', '/get-support');

export default async function GetSupportPage() {
  const [{ getSupport: gs }, pillars, contact] = await Promise.all([getContent(), getPillars(), getContact()]);
  return (
    <>
      <PageHeader crumb="Get Support" header={gs.header}>
        <ol className="steps-indicator" aria-label="How it works">
          <li><span aria-hidden="true">1</span>Choose what you need</li>
          <li><span aria-hidden="true">2</span>See how we can help</li>
          <li><span aria-hidden="true">3</span>Send us a message</li>
        </ol>
      </PageHeader>
      <SupportFlow
        pillars={pillars}
        text={{ needTitle: gs.needTitle, formTitle: gs.formTitle, successText: gs.successText }}
        contact={{ email: contact.email, phones: contact.phones, street: contact.street, city: contact.city, region: contact.region, postal: contact.postal }}
      />
    </>
  );
}
