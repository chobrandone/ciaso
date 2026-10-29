'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';

type Photo = { src: string; alt: string };

/** Grid of event photos; clicking one opens it full size with previous / next. */
export default function PhotoGallery({ photos }: { photos: Photo[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (index !== null && !d.open) d.showModal();
    if (index === null && d.open) d.close();
  }, [index]);

  const step = (by: number) => setIndex((i) => (i === null ? i : (i + by + photos.length) % photos.length));
  const current = index === null ? null : photos[index];

  return (
    <>
      <ul className={`photo-grid photo-grid--${Math.min(photos.length, 6)}`} role="list">
        {photos.map((p, i) => (
          <li key={p.src}>
            <button type="button" onClick={() => setIndex(i)} aria-label={`Open photo ${i + 1} of ${photos.length}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.alt} loading="lazy" />
            </button>
          </li>
        ))}
      </ul>

      <dialog ref={dialog} className="lightbox" aria-label="Event photos" onClose={() => setIndex(null)}
        onClick={(e) => { if (e.target === e.currentTarget) setIndex(null); }}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); }}>
        {current && (
          <figure className="lightbox__figure">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.src} alt={current.alt} />
            <figcaption>{index! + 1} / {photos.length}</figcaption>
          </figure>
        )}
        <button type="button" className="lightbox__close" onClick={() => setIndex(null)} aria-label="Close"><Icon name="close" /></button>
        {photos.length > 1 && (
          <>
            <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => step(-1)} aria-label="Previous photo"><Icon name="arrow" /></button>
            <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => step(1)} aria-label="Next photo"><Icon name="arrow" /></button>
          </>
        )}
      </dialog>
    </>
  );
}
