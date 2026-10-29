'use client';

import { useEffect, useRef, useState } from 'react';

/** Longest side, in pixels, of an uploaded image after it is resized in the browser. */
const MAX_SIDE = 1800;

/** Shrinks a photo in the browser so several fit in one upload (hosts like Vercel cap a request at 4.5 MB). */
async function shrink(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 600 * 1024) return file;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff'; // transparent PNGs become white, not black, as JPEG
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    return file; // the server still validates it
  }
}

/**
 * File input with previews. `max` limits how many files can be chosen at once.
 * Large photos are resized before upload, so admins can pick photos straight from a phone or camera.
 */
export default function ImagePicker({ name, id, max = 1, label }: { name: string; id: string; max?: number; label: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p)), [previews]);

  const onChange = async () => {
    const el = input.current!;
    const files = Array.from(el.files ?? []);
    setError('');
    if (files.length > max) {
      const msg = max === 0 ? 'This event already has 6 photos. Tick “Remove” on some first.' : `You can add ${max} more photo${max === 1 ? '' : 's'} (6 per event). You chose ${files.length}.`;
      el.setCustomValidity(msg);
      setError(msg);
      setPreviews([]);
      return;
    }
    el.setCustomValidity('Please wait – preparing your images…');
    setBusy(true);
    const ready = await Promise.all(files.map(shrink));
    const dt = new DataTransfer();
    ready.forEach((f) => dt.items.add(f));
    el.files = dt.files;
    el.setCustomValidity('');
    setBusy(false);
    setPreviews(ready.map((f) => URL.createObjectURL(f)));
  };

  return (
    <div className="image-picker">
      <label htmlFor={id} className="btn btn--secondary btn--sm image-picker__btn">{label}</label>
      <input ref={input} className="visually-hidden" id={id} name={name} type="file" accept="image/jpeg,image/png,image/webp"
        multiple={max > 1} onChange={onChange} disabled={max === 0} aria-describedby={`${id}-status`} />
      <p id={`${id}-status`} className={error ? 'field-error' : 'hint'} aria-live="polite">
        {error || (busy ? 'Preparing images…' : previews.length ? `${previews.length} new image${previews.length > 1 ? 's' : ''} ready – click Save to upload.` : '')}
      </p>
      {previews.length > 0 && (
        <ul className="admin-gallery" role="list">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {previews.map((p) => <li key={p}><img src={p} alt="" /><span className="pill pill--type">New</span></li>)}
        </ul>
      )}
    </div>
  );
}
