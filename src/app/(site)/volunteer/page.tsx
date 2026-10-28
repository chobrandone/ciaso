import PageHeader from '@/components/PageHeader';
import Icon from '@/components/Icon';
import { SubmissionForm, TextField, TextArea, Consent, CheckGroup, RequiredNote } from '@/components/forms';
import { volunteerInterests } from '@/lib/validation';
import { getContent } from '@/lib/content';
import { headerMetadata } from '@/lib/page-meta';

export const generateMetadata = () => headerMetadata('volunteer', '/volunteer');

export default async function VolunteerPage() {
  const { volunteer: v } = await getContent();
  return (
    <>
      <PageHeader crumb="Volunteer" header={v.header}>
        <div className="btn-row"><a className="btn btn--primary" href="#volunteer-form">Apply to Volunteer</a></div>
      </PageHeader>

      <section className="section" aria-labelledby="about-volunteer">
        <div className="container split split--wide-left" style={{ alignItems: 'start' }}>
          <div className="reveal reveal--left">
            <p className="eyebrow">{v.eyebrow}</p>
            <h2 id="about-volunteer">{v.title}</h2>
            <p className="lead">{v.text}</p>
            {v.roles.length > 0 && (
              <ul className="checklist">{v.roles.map((r) => <li key={r}><Icon name="check" /><span><strong>{r}</strong></span></li>)}</ul>
            )}
            {v.closing && <p>{v.closing}</p>}
          </div>
          <div className="form-card reveal reveal--right">
            <h3 style={{ fontSize: '1.5rem' }}>{v.formTitle}</h3>
            <RequiredNote />
            <SubmissionForm type="volunteer" grid={false} submitLabel="Apply to volunteer" successTitle="Thank you for offering your time"
              successBody={<p>We’ve received your application. A member of the CIASO team will contact you about next steps.</p>}>
              <TextField name="name" label="Full name" required autoComplete="name" maxLength={120} />
              <TextField name="email" label="Email" type="email" required autoComplete="email" />
              <TextField name="phone" label="Phone" type="tel" autoComplete="tel" maxLength={20} />
              <CheckGroup name="interests" legend="How would you like to help?" options={volunteerInterests} required />
              <TextArea name="message" label="Tell us about yourself" hint="Your skills, languages you speak, and when you’re available." />
              <Consent label="I agree that CIASO may use this information to contact me about volunteering." />
            </SubmissionForm>
          </div>
        </div>
      </section>
    </>
  );
}
