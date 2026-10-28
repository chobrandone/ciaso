'use client';

import { useEffect, useState } from 'react';
import Icon from './Icon';

export default function ShareBar({ url, label = 'Share this page:' }: { url: string; label?: string }) {
  const [canCopy, setCanCopy] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => setCanCopy(!!navigator.clipboard), []);
  const enc = encodeURIComponent(url);

  return (
    <div className="share">
      <span className="share__label">{label}</span>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc}`} rel="noopener" target="_blank">
        <Icon name="linkedin" />LinkedIn<span className="visually-hidden"> (opens in a new tab)</span>
      </a>
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`} rel="noopener" target="_blank">
        <Icon name="facebook" />Facebook<span className="visually-hidden"> (opens in a new tab)</span>
      </a>
      {canCopy && (
        <button type="button" onClick={() => navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); })}>
          <Icon name="link" /><span aria-live="polite">{copied ? 'Link copied' : 'Copy link'}</span>
        </button>
      )}
    </div>
  );
}
