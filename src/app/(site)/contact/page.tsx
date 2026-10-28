import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import Icon from '@/components/Icon';
import { SubmissionForm, TextField, SelectField, TextArea, Consent, RequiredNote } from '@/components/forms';
import { getContact, getContent } from '@/lib/content';
import { headerMetadata } from '@/lib/page-meta';
import { contactTopics, labels } from '@/lib/validation';

export const generateMetadata = () => headerMetadata('contactPage', '/contact');

export default async function ContactPage() {
  const [{ contactPage: cp }, site] = await Promise.all([getContent(), getContact()]);
  return (
    <>
      <PageHeader crumb="Contact" header={cp.header}>
        <p className="page-header__lead" style={{ fontSize: 'var(--fs-base)' }}>
          <strong>Looking for help for yourself or your family?</strong> Our <Link href="/get-support" style={{ textDecoration: 'underline' }}>Get Support</Link> page will guide you to the right program.
        </p>
      </PageHeader>

      <section className="section" aria-labelledby="contact-form-title">
        <div className="container split split--wide-left" style={{ alignItems: 'start' }}>
          <div className="form-card reveal">
            <h2 id="contact-form-title">{cp.formTitle}</h2>
            <RequiredNote />
            <SubmissionForm type="contact" submitLabel="Send message" successTitle="Thank you – your message has been sent"
              successBody={<p>A member of the CIASO team will get back to you using the contact details you provided.</p>}>
              <TextField name="name" label="Full name" required autoComplete="name" maxLength={120} />
              <TextField name="email" label="Email" type="email" required autoComplete="email" />
              <TextField name="phone" label="Phone" type="tel" autoComplete="tel" maxLength={20} />
              <SelectField name="topic" label="Topic" required placeholder="Choose a topic…" fromQuery="topic" options={contactTopics.map((t) => [t, labels.topic[t]] as const)} />
              <TextArea name="message" label="Message" required className="span-2" hint="Please don’t include sensitive information such as your SIN, immigration document numbers or financial details." />
              <Consent className="span-2" label="I agree that CIASO may use this information to respond to my message." />
              <p className="privacy-note span-2">We only use your information to respond to your message. We don’t sell or share it for marketing.</p>
            </SubmissionForm>
          </div>

          <div className="reveal reveal--right" aria-labelledby="details-title">
            <h2 id="details-title" style={{ fontSize: 'var(--fs-h3)' }}>{cp.detailsTitle}</h2>
            <ul className="contact-list">
              <li><span className="icon-wrap"><Icon name="pin" /></span><div><h3>Visit our office</h3><p>{site.street}<br />{site.city}, {site.region} {site.postal}</p><p><a className="text-link" href={site.mapUrl} rel="noopener" target="_blank">Get directions <Icon name="external" /><span className="visually-hidden">(opens in a new tab)</span></a></p></div></li>
              <li><span className="icon-wrap"><Icon name="phone" /></span><div><h3>Call us</h3><p>{site.phones.map((p, i) => <span key={p.tel}>{i > 0 && <br />}<a href={`tel:${p.tel}`}>{p.display}</a></span>)}</p></div></li>
              <li><span className="icon-wrap"><Icon name="mail" /></span><div><h3>Email us</h3><p><a href={`mailto:${site.email}`}>{site.email}</a></p></div></li>
              <li><span className="icon-wrap"><Icon name="clock" /></span><div><h3>Office hours</h3><p>{site.hours}</p></div></li>
            </ul>
            <h3 style={{ marginTop: '2rem', fontSize: '1.125rem' }}>Follow CIASO</h3>
            <ul className="social" aria-label="CIASO on social media" style={{ listStyle: 'none', padding: 0 }}>
              {site.linkedin && <li><a href={site.linkedin} rel="noopener" target="_blank"><Icon name="linkedin" /><span className="visually-hidden">CIASO on LinkedIn (opens in a new tab)</span></a></li>}
              {site.facebook && <li><a href={site.facebook} rel="noopener" target="_blank"><Icon name="facebook" /><span className="visually-hidden">CIASO on Facebook (opens in a new tab)</span></a></li>}
              {site.youtube && <li><a href={site.youtube} rel="noopener" target="_blank"><Icon name="youtube" /><span className="visually-hidden">CIASO on YouTube (opens in a new tab)</span></a></li>}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
