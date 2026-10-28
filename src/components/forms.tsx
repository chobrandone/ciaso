'use client';

import { createContext, useContext, useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import Icon from './Icon';

type Errors = Record<string, string>;
const FormCtx = createContext<{ prefix: string; errors: Errors; clear: (name: string) => void }>({ prefix: 'f', errors: {}, clear: () => {} });

const fieldId = (prefix: string, name: string) => `${prefix}-${name}`;

function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <p className="field-error" id={id} hidden={!message}>
      {message && <><Icon name="alert" /><span>{message}</span></>}
    </p>
  );
}

const Req = () => <span className="req" aria-hidden="true"> *</span>;
const Opt = () => <span className="optional"> (optional)</span>;

export function TextField({ name, label, type = 'text', required, autoComplete, maxLength = 160, hint, className = '' }: {
  name: string; label: string; type?: 'text' | 'email' | 'tel'; required?: boolean; autoComplete?: string; maxLength?: number; hint?: string; className?: string;
}) {
  const { prefix, errors, clear } = useContext(FormCtx);
  const id = fieldId(prefix, name);
  const describedBy = [hint && `${id}-hint`, `${id}-error`].filter(Boolean).join(' ');
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}{required ? <Req /> : <Opt />}</label>
      {hint && <p className="hint" id={`${id}-hint`}>{hint}</p>}
      <input className="input" id={id} name={name} type={type} autoComplete={autoComplete} maxLength={maxLength}
        aria-required={required || undefined} aria-invalid={errors[name] ? true : undefined} aria-describedby={describedBy}
        onChange={() => errors[name] && clear(name)} />
      <FieldError id={`${id}-error`} message={errors[name]} />
    </div>
  );
}

export function TextArea({ name, label, required, hint, maxLength = 3000, className = '' }: {
  name: string; label: string; required?: boolean; hint?: string; maxLength?: number; className?: string;
}) {
  const { prefix, errors, clear } = useContext(FormCtx);
  const id = fieldId(prefix, name);
  const describedBy = [hint && `${id}-hint`, `${id}-error`].filter(Boolean).join(' ');
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}{required ? <Req /> : <Opt />}</label>
      {hint && <p className="hint" id={`${id}-hint`}>{hint}</p>}
      <textarea className="textarea" id={id} name={name} maxLength={maxLength}
        aria-required={required || undefined} aria-invalid={errors[name] ? true : undefined} aria-describedby={describedBy}
        onChange={() => errors[name] && clear(name)} />
      <FieldError id={`${id}-error`} message={errors[name]} />
    </div>
  );
}

export function SelectField({ name, label, options, required, placeholder = 'Choose one…', value, onChange, fromQuery, className = '' }: {
  name: string; label: string; options: readonly (readonly [string, string])[]; required?: boolean; placeholder?: string | null;
  value?: string; onChange?: (v: string) => void; fromQuery?: string; className?: string;
}) {
  const { prefix, errors, clear } = useContext(FormCtx);
  const id = fieldId(prefix, name);
  const ref = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    if (!fromQuery || value !== undefined) return;
    const q = new URLSearchParams(window.location.search).get(fromQuery);
    if (q && ref.current && options.some(([v]) => v === q)) ref.current.value = q;
  }, [fromQuery, options, value]);
  const controlled = value !== undefined ? { value, onChange: (e: ChangeEvent<HTMLSelectElement>) => { onChange?.(e.target.value); clear(name); } } : { onChange: () => errors[name] && clear(name) };
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}{required ? <Req /> : <Opt />}</label>
      <select ref={ref} className="select" id={id} name={name} aria-required={required || undefined} aria-invalid={errors[name] ? true : undefined}
        aria-describedby={`${id}-error`} {...controlled}>
        {placeholder !== null && <option value="">{placeholder}</option>}
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <FieldError id={`${id}-error`} message={errors[name]} />
    </div>
  );
}

export function CheckGroup({ name, legend, options, required }: { name: string; legend: string; options: readonly string[]; required?: boolean }) {
  const { prefix, errors, clear } = useContext(FormCtx);
  const id = fieldId(prefix, name);
  return (
    <fieldset className="field" aria-describedby={`${id}-error`}>
      <legend>{legend}{required ? <Req /> : <Opt />}</legend>
      <div className="checks">
        {options.map((o, i) => (
          <label key={o} className="choice">
            <input type="checkbox" id={i === 0 ? id : undefined} name={name} value={o} aria-invalid={errors[name] ? true : undefined} onChange={() => errors[name] && clear(name)} />
            {o}
          </label>
        ))}
      </div>
      <FieldError id={`${id}-error`} message={errors[name]} />
    </fieldset>
  );
}

export function Consent({ label, name = 'consent', className = '' }: { label: string; name?: string; className?: string }) {
  const { prefix, errors, clear } = useContext(FormCtx);
  const id = fieldId(prefix, name);
  return (
    <div className={`field ${className}`}>
      <div className="choice">
        <input id={id} name={name} type="checkbox" aria-required="true" aria-invalid={errors[name] ? true : undefined} aria-describedby={`${id}-error`} onChange={() => errors[name] && clear(name)} />
        <label htmlFor={id}>{label}<Req /></label>
      </div>
      <FieldError id={`${id}-error`} message={errors[name]} />
    </div>
  );
}

type Status = 'idle' | 'sending' | 'done';

export function SubmissionForm({ type, submitLabel, successTitle, successBody, grid = true, children }: {
  type: 'support' | 'contact' | 'volunteer' | 'partner';
  submitLabel: string; successTitle: string; successBody: ReactNode; grid?: boolean; children: ReactNode;
}) {
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [alert, setAlert] = useState('');
  const [startedAt, setStartedAt] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);
  const prefix = type;

  useEffect(() => setStartedAt(Date.now()), []);
  const [popup, setPopup] = useState<PopupData | null>(null);
  // Focus the inline confirmation once the popup has been closed (or straight away if there is none)
  useEffect(() => { if (status === 'done' && !popup) doneRef.current?.focus(); }, [status, popup]);

  const clear = (name: string) => setErrors((e) => { const n = { ...e }; delete n[name]; return n; });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body: Record<string, unknown> = {};
    for (const key of new Set(fd.keys())) {
      const all = fd.getAll(key).map(String);
      body[key] = key === 'interests' ? all : all[0];
    }
    if (form.querySelector('input[name="interests"]') && !body.interests) body.interests = [];
    setAlert('');
    setStatus('sending');
    try {
      const res = await fetch(`/api/submissions/${type}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.popup) setPopup({ ...data.popup, emailSent: !!data.emailSent, email: String(body.email ?? '') });
        setStatus('done'); setErrors({}); return;
      }
      const data = await res.json().catch(() => ({}));
      setStatus('idle');
      if (res.status === 422 && data.errors) {
        setErrors(data.errors);
        requestAnimationFrame(() => summaryRef.current?.focus());
      } else {
        setAlert(data.error || 'Sorry, your message could not be sent. Please try again, or email admin@ciaso.ca.');
        requestAnimationFrame(() => alertRef.current?.focus());
      }
    } catch {
      setStatus('idle');
      setAlert('Sorry, your message could not be sent. Please check your connection and try again, or email admin@ciaso.ca.');
      requestAnimationFrame(() => alertRef.current?.focus());
    }
  }

  if (status === 'done') {
    return (
      <>
      {popup && <SuccessPopup data={popup} onClose={() => setPopup(null)} />}
      <div className="form-status" role="status" tabIndex={-1} ref={doneRef}>
        <div className="form-status__icon"><Icon name="check" /></div>
        <h3>{successTitle}</h3>
        {successBody}
      </div>
      </>
    );
  }

  // Order the summary like the fields on the page
  const ordered = Object.entries(errors).sort(([a], [b]) => {
    const els = Array.from(formRef.current?.querySelectorAll('[name]') ?? []).map((el) => el.getAttribute('name'));
    return els.indexOf(a) - els.indexOf(b);
  });

  return (
    <form ref={formRef} id={`${type}-form`} noValidate onSubmit={onSubmit}>
      <FormCtx.Provider value={{ prefix, errors, clear }}>
        {ordered.length > 0 && (
          <div className="error-summary" tabIndex={-1} ref={summaryRef} role="alert">
            <h3>{ordered.length === 1 ? 'There is 1 problem with your form' : `There are ${ordered.length} problems with your form`}</h3>
            <ul>
              {ordered.map(([name, msg]) => (
                <li key={name}><a href={`#${fieldId(prefix, name)}`} onClick={(ev) => { ev.preventDefault(); document.getElementById(fieldId(prefix, name))?.focus(); }}>{msg}</a></li>
              ))}
            </ul>
          </div>
        )}
        {alert && <div className="form-alert" role="alert" tabIndex={-1} ref={alertRef}>{alert}</div>}
        <div className={grid ? 'form-grid form-grid--2' : 'form-grid'}>
          {children}
          <div className="hp" aria-hidden="true">
            <label htmlFor={`${prefix}-website`}>Leave this field empty</label>
            <input id={`${prefix}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>
          <input type="hidden" name="startedAt" value={startedAt} />
          <div className="span-2">
            <button className="btn btn--primary" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : submitLabel}</button>
          </div>
        </div>
      </FormCtx.Provider>
    </form>
  );
}

export const RequiredNote = () => (
  <p className="note">Fields marked <span className="req" aria-hidden="true">*</span><span className="visually-hidden">with an asterisk</span> are required.</p>
);

type PopupData = { title: string; text: string; emailText: string; emailSent: boolean; email: string };

/** “Congratulations – message sent” dialog shown after a successful submission. */
function SuccessPopup({ data, onClose }: { data: PopupData; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    const handle = () => onClose();
    d?.addEventListener('close', handle);
    return () => d?.removeEventListener('close', handle);
  }, [onClose]);
  return (
    <dialog ref={ref} className="success-popup" aria-labelledby="success-popup-title" aria-describedby="success-popup-text"
      onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}>
      <div className="success-popup__inner">
        <div className="success-popup__burst" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <span key={i} style={{ '--i': i } as React.CSSProperties} />)}</div>
        <div className="success-popup__icon" aria-hidden="true">
          <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" /><path d="m15 27 7 7 15-16" /></svg>
        </div>
        <h2 id="success-popup-title">{data.title}</h2>
        <p id="success-popup-text">{data.text}</p>
        {data.emailSent && data.email && <p className="success-popup__email"><Icon name="mail" />{data.emailText.replace('{email}', data.email)}</p>}
        <button type="button" className="btn btn--primary" autoFocus onClick={() => ref.current?.close()}>Close</button>
      </div>
    </dialog>
  );
}
