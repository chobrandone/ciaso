'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import type { ContentState } from '../../../actions';
import type { Field, Section, SubField } from '@/lib/content-schema';

type Values = Record<string, unknown>;

const BUILT_IN_IMAGES = [
  ['/images/community-group-1600.jpg', 'Group photo'],
  ['/images/newcomers-arriving-1024.jpg', 'Newcomers with backpacks'],
  ['/images/professional-1024.jpg', 'Professional on a balcony']
] as const;

function Scalar({ field, value, onChange, id, uploadName }: { field: SubField; value: unknown; onChange: (v: unknown) => void; id: string; uploadName: string }) {
  const hint = field.hint && <p className="hint" id={`${id}-hint`}>{field.hint}</p>;
  const common = { id, 'aria-describedby': field.hint ? `${id}-hint` : undefined };
  switch (field.type) {
    case 'textarea':
      return <div className="field"><label htmlFor={id}>{field.label}</label>{hint}<textarea className="textarea" {...common} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} style={{ minHeight: String(value ?? '').length > 400 ? 260 : 110 }} /></div>;
    case 'lines':
      return (
        <div className="field">
          <label htmlFor={id}>{field.label}</label>{hint}
          <textarea className="textarea" {...common} value={(Array.isArray(value) ? value : []).join('\n')} onChange={(e) => onChange(e.target.value.split('\n'))} style={{ minHeight: 110 }} />
        </div>
      );
    case 'select':
      return (
        <div className="field">
          <label htmlFor={id}>{field.label}</label>
          <select className="select" {...common} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)}>
            {field.options?.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      );
    case 'image': {
      const src = String(value ?? '');
      return (
        <fieldset className="field image-field">
          <legend>{field.label}</legend>
          <div className="image-field__row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {src ? <img src={src} alt="" className="image-field__preview" /> : <span className="image-field__preview image-field__preview--empty">No image</span>}
            <div className="image-field__controls">
              <label className="hint" htmlFor={`${id}-file`}>Upload a new image (JPG, PNG or WebP, up to 5 MB):</label>
              <input className="input" id={`${id}-file`} name={uploadName} type="file" accept="image/jpeg,image/png,image/webp" />
              <label className="hint" htmlFor={`${id}-pick`}>Or choose a built-in photo:</label>
              <select className="select" id={`${id}-pick`} value={BUILT_IN_IMAGES.some(([v]) => v === src) ? src : ''} onChange={(e) => e.target.value && onChange(e.target.value)}>
                <option value="">{src && !BUILT_IN_IMAGES.some(([v]) => v === src) ? 'Uploaded image (current)' : 'Choose…'}</option>
                {BUILT_IN_IMAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
        </fieldset>
      );
    }
    default:
      return (
        <div className="field">
          <label htmlFor={id}>{field.label}</label>{hint}
          <input className="input" {...common} type={field.type === 'url' ? 'text' : field.type} value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} />
        </div>
      );
  }
}

function FieldEditor({ field, value, onChange, path }: { field: Field; value: unknown; onChange: (v: unknown) => void; path: string }) {
  if (field.type === 'group') {
    const v = (value ?? {}) as Values;
    return (
      <fieldset className="content-group">
        <legend>{field.label}</legend>
        {field.fields.map((f) => (
          <Scalar key={f.key} field={f} id={`${path}-${f.key}`} uploadName={`upload:${field.key}.${f.key}`} value={v[f.key]} onChange={(nv) => onChange({ ...v, [f.key]: nv })} />
        ))}
      </fieldset>
    );
  }
  if (field.type === 'repeat') {
    const list = (Array.isArray(value) ? value : []) as Values[];
    const update = (i: number, nv: Values) => onChange(list.map((it, j) => (j === i ? nv : it)));
    const move = (i: number, d: number) => { const n = [...list]; const [it] = n.splice(i, 1); n.splice(i + d, 0, it); onChange(n); };
    return (
      <fieldset className="content-group">
        <legend>{field.label}</legend>
        {field.hint && <p className="hint">{field.hint}</p>}
        <ol className="repeat-list">
          {list.map((item, i) => (
            <li key={i} className="repeat-item">
              <div className="repeat-item__head">
                <strong>{field.itemLabel} {i + 1}{field.titleKey && item[field.titleKey] ? `: ${String(item[field.titleKey])}` : ''}</strong>
                {!field.fixed && (
                  <span className="btn-row">
                    <button type="button" className="btn btn--secondary btn--sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${field.itemLabel.toLowerCase()} ${i + 1} up`}>↑</button>
                    <button type="button" className="btn btn--secondary btn--sm" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${field.itemLabel.toLowerCase()} ${i + 1} down`}>↓</button>
                    <button type="button" className="btn btn--danger btn--sm" onClick={() => window.confirm(`Remove ${field.itemLabel.toLowerCase()} ${i + 1}?`) && onChange(list.filter((_, j) => j !== i))}>Remove</button>
                  </span>
                )}
              </div>
              {field.fields.map((f) => (
                <Scalar key={f.key} field={f} id={`${path}-${i}-${f.key}`} uploadName={`upload:${field.key}.${i}.${f.key}`} value={item[f.key]} onChange={(nv) => update(i, { ...item, [f.key]: nv })} />
              ))}
            </li>
          ))}
        </ol>
        {!field.fixed && (
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => onChange([...list, Object.fromEntries(field.fields.map((f) => [f.key, f.type === 'lines' ? [] : f.type === 'select' ? f.options?.[0]?.[0] ?? '' : '']))])}>
            + Add {field.itemLabel.toLowerCase()}
          </button>
        )}
      </fieldset>
    );
  }
  return <Scalar field={field} id={path} uploadName={`upload:${field.key}`} value={value} onChange={onChange} />;
}

export default function ContentEditor({ section, values, action }: {
  section: Section; values: Values; action: (prev: ContentState, fd: FormData) => Promise<ContentState>;
}) {
  const [state, setState] = useState<Values>(values);
  const [dirty, setDirty] = useState(false);
  const [result, formAction, saving] = useActionState(action, {});
  const formRef = useRef<HTMLFormElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  // When the stored values change (after a save or “Restore original”), show them unless the admin is mid-edit
  const valuesKey = JSON.stringify(values);
  useEffect(() => {
    if (!dirty) setState(JSON.parse(valuesKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valuesKey]);

  // After a successful save, show the saved values (e.g. new image URLs) and clear chosen files
  useEffect(() => {
    if (result.ok && result.values) {
      setState(result.values);
      setDirty(false);
      formRef.current?.querySelectorAll<HTMLInputElement>('input[type=file]').forEach((i) => { i.value = ''; });
    }
    if (result.ok || result.error) noticeRef.current?.focus();
  }, [result]);

  return (
    <form ref={formRef} action={formAction} className="panel admin-form">
      <div ref={noticeRef} tabIndex={-1} aria-live="polite">
        {result.error && <div className="notice notice--error" role="alert">{result.error}</div>}
        {result.ok && !dirty && <div className="notice notice--ok" role="status">Changes saved and published to the website.</div>}
        {result.ok && result.warning && <div className="notice notice--error" role="alert">{result.warning}</div>}
      </div>
      <input type="hidden" name="section" value={section.id} />
      <input type="hidden" name="payload" value={JSON.stringify(state)} />
      {section.fields.map((f) => (
        <FieldEditor key={f.key} field={f} path={`c-${f.key}`} value={state[f.key]} onChange={(v) => { setState((s) => ({ ...s, [f.key]: v })); setDirty(true); }} />
      ))}
      <div className="form-actions content-actions">
        <button className="btn btn--primary" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
        {dirty && !saving && <span className="note">You have unsaved changes.</span>}
        {result.ok && !dirty && <span className="note">Saved.</span>}
      </div>
    </form>
  );
}
