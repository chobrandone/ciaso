'use client';

import { useEffect, useRef } from 'react';

/** Hosts such as Vercel reject request bodies over 4.5 MB, so keep each submission's images under this. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/**
 * Place inside a form that has file inputs. Before the form is sent it checks the total size
 * of the chosen files and stops the submission with a clear message if they are too large.
 */
export default function UploadSizeGuard() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const form = ref.current?.closest('form');
    if (!form) return;
    // Document capture phase runs before React's own submit handling
    const onSubmit = (e: Event) => {
      if (e.target !== form) return;
      let total = 0;
      form.querySelectorAll<HTMLInputElement>('input[type=file]').forEach((i) => {
        for (const f of Array.from(i.files ?? [])) total += f.size;
      });
      if (total > MAX_UPLOAD_BYTES) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const mb = (total / 1024 / 1024).toFixed(1);
        window.alert(`The images you chose add up to ${mb} MB. Please upload at most 4 MB at a time: choose fewer photos, or make them smaller (for example by saving them at a lower size or quality), then try again.`);
      }
    };
    document.addEventListener('submit', onSubmit, true);
    return () => document.removeEventListener('submit', onSubmit, true);
  }, []);
  return <span ref={ref} hidden />;
}
