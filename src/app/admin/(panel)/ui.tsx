'use client';

import type { ReactNode } from 'react';
import Icon from '@/components/Icon';

/** Submit button that asks for confirmation first (used for deletes). */
export function ConfirmButton({ message, children, className = 'btn btn--danger btn--sm' }: { message: string; children: ReactNode; className?: string }) {
  return (
    <button type="submit" className={className} onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}

export function Notice({ params }: { params: Record<string, string | undefined> }) {
  if (params.error) return <div className="notice notice--error" role="alert"><Icon name="alert" />{params.error}</div>;
  const ok: Record<string, string> = { '1': 'Changes saved.', password: 'Your password has been changed.', admin: 'Admin account created.', removed: 'Admin account removed.', reset: 'Original text restored.' };
  if (params.saved) return <div className="notice notice--ok" role="status"><Icon name="check" />{ok[params.saved] ?? 'Saved.'}</div>;
  if (params.deleted) return <div className="notice notice--ok" role="status"><Icon name="check" />Deleted.</div>;
  return null;
}
