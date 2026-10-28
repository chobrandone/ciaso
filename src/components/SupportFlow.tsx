'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Icon, { type IconName } from './Icon';
import { SubmissionForm, TextField, SelectField, TextArea, Consent, RequiredNote } from './forms';

export type SupportPillar = { key: string; icon: IconName; name: string; items: string[] };
export type SupportText = { needTitle: string; formTitle: string; successText: string };
export type AsideContact = { email: string; phones: { display: string; tel: string }[]; street: string; city: string; region: string; postal: string };

export default function SupportFlow({ pillars, text, contact }: { pillars: SupportPillar[]; text: SupportText; contact: AsideContact }) {
  const needs: { value: string; icon: IconName; title: string; help: string[] }[] = [
    ...pillars.map((p) => ({ value: p.key, icon: p.icon, title: p.name, help: p.items })),
    { value: 'other', icon: 'alert', title: 'Not sure', help: [] }
  ];
  const [need, setNeed] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('need');
    if (q && (q === 'other' || pillars.some((p) => p.key === q))) setNeed(q);
  }, [pillars]);

  const choose = (value: string) => {
    setNeed(value);
    requestAnimationFrame(() => panelRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' }));
  };
  const active = needs.find((n) => n.value === need);

  return (
    <>
      <section className="section section--tight" aria-labelledby="need-title">
        <div className="container">
          <fieldset>
            <legend><h2 id="need-title" style={{ fontSize: 'var(--fs-h3)' }}>{text.needTitle}</h2></legend>
            <div className="needs">
              {needs.map((n) => (
                <div key={n.value} className="need">
                  <input type="radio" name="need" id={`need-${n.value}`} value={n.value} checked={need === n.value} onChange={() => choose(n.value)} />
                  <label htmlFor={`need-${n.value}`}>
                    <Icon name={n.icon} /><span className="need__title">{n.title}</span>
                    <span className="need__desc">{n.help.length ? n.help.slice(0, 3).join(' · ') : 'Tell us about your situation'}</span>
                  </label>
                </div>
              ))}
            </div>
          </fieldset>

          <div aria-live="polite" ref={panelRef}>
            {active && (
              <div className="need-panel anim-up">
                <h3>{active.value === 'other' ? 'Not sure where to start?' : active.title}</h3>
                {active.help.length > 0 ? (
                  <ul className="checklist">{active.help.map((h) => <li key={h}><Icon name="check" />{h}</li>)}</ul>
                ) : (
                  <p>That’s fine. Tell us a little about your situation and we’ll help you find your next step.</p>
                )}
                {active.value === 'thrive' && (
                  <p className="note"><strong>In an emergency, call 911.</strong> If you are in crisis, call or text <strong>988</strong> (24/7). CIASO cannot respond to emergencies.</p>
                )}
                <div className="btn-row"><a className="btn btn--primary" href="#support-form">Send us a message</a></div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section section--surface" aria-labelledby="support-form-title">
        <div className="container split split--wide-left" style={{ alignItems: 'start' }}>
          <div className="form-card reveal">
            <h2 id="support-form-title">{text.formTitle}</h2>
            <RequiredNote />
            <SubmissionForm
              type="support"
              submitLabel="Send request"
              successTitle="Thank you – we’ve received your request"
              successBody={<p>{text.successText} Meanwhile, see our <Link href="/events">current events</Link>.</p>}
            >
              <TextField name="name" label="Full name" required autoComplete="name" maxLength={120} />
              <TextField name="email" label="Email" type="email" required autoComplete="email" />
              <TextField name="phone" label="Phone" type="tel" autoComplete="tel" maxLength={20} />
              <SelectField name="contact_preference" label="Best way to reach you" placeholder={null} options={[['email', 'Email'], ['phone', 'Phone call']]} />
              <SelectField name="topic" label="I need help with" required className="span-2" value={need} onChange={setNeed}
                options={needs.map((n) => [n.value, n.title] as const)} />
              <TextArea name="message" label="How can we help?" required className="span-2"
                hint="A few sentences is enough. Please don’t include sensitive information such as your SIN or immigration document numbers." />
              <Consent className="span-2" label="I agree that CIASO may use the information in this form to contact me about my request." />
            </SubmissionForm>
          </div>
          <ContactAside contact={contact} />
        </div>
      </section>
    </>
  );
}

export function ContactAside({ contact }: { contact: AsideContact }) {
  return (
    <div className="reveal reveal--right">
      <h2 style={{ fontSize: 'var(--fs-h3)' }}>Prefer to talk to someone?</h2>
      <ul className="contact-list">
        {contact.phones.length > 0 && <li><span className="icon-wrap"><Icon name="phone" /></span><div><h3>Call</h3><p>{contact.phones.map((p, i) => <span key={p.tel}>{i > 0 && <br />}<a href={`tel:${p.tel}`}>{p.display}</a></span>)}</p></div></li>}
        <li><span className="icon-wrap"><Icon name="mail" /></span><div><h3>Email</h3><p><a href={`mailto:${contact.email}`}>{contact.email}</a></p></div></li>
        <li><span className="icon-wrap"><Icon name="pin" /></span><div><h3>Visit</h3><p>{contact.street}<br />{contact.city}, {contact.region} {contact.postal}</p></div></li>
      </ul>
    </div>
  );
}
