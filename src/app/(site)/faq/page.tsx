import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import Icon from '@/components/Icon';
import { getContact, getContent } from '@/lib/content';
import { headerMetadata } from '@/lib/page-meta';

export const generateMetadata = () => headerMetadata('faq', '/faq');

export default async function FaqPage() {
  const [{ faq }, contact] = await Promise.all([getContent(), getContact()]);
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.items.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })) };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHeader crumb="FAQ" header={faq.header} />
      <section className="section">
        <div className="container split split--wide-left" style={{ alignItems: 'start' }}>
          <div className="faq reveal">
            {faq.items.map((f, i) => (
              <details key={i} open={i === 0}><summary>{f.question}</summary><div className="faq__body"><p>{f.answer}</p></div></details>
            ))}
          </div>
          <div className="callout reveal reveal--right">
            <Icon name="mail" />
            <div>
              <p><strong>Didn’t find your answer?</strong></p>
              <p>Our team is happy to help. <Link href="/get-support">Get support</Link>, <Link href="/contact">contact us</Link>
                {contact.phones[0] && <> or call <a href={`tel:${contact.phones[0].tel}`}>{contact.phones[0].display}</a></>}.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
