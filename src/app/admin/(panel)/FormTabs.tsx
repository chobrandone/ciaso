'use client';

import { useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';

/**
 * Splits one long form into tabs. Every tab stays in the form (only hidden), so one Save sends everything.
 * If a required field on a hidden tab is empty, that tab opens so the browser can point at the field.
 */
export default function FormTabs({ tabs, children }: { tabs: string[]; children: ReactNode[] }) {
  const [active, setActive] = useState(0);
  return (
    <div onInvalidCapture={(e) => {
      const i = Number((e.target as HTMLElement).closest<HTMLElement>('[data-tab]')?.dataset.tab);
      if (!Number.isNaN(i) && i !== active) flushSync(() => setActive(i));
    }}>
      <div className="admin-tabs" role="tablist" aria-label="Form sections">
        {tabs.map((t, i) => (
          <button key={t} type="button" role="tab" id={`tab-${i}`} aria-selected={active === i} aria-controls={`tabpanel-${i}`}
            className="admin-tabs__btn" onClick={() => setActive(i)}>{t}</button>
        ))}
      </div>
      {children.map((c, i) => (
        <div key={i} role="tabpanel" id={`tabpanel-${i}`} aria-labelledby={`tab-${i}`} data-tab={i} hidden={active !== i} className="admin-form">
          {c}
        </div>
      ))}
    </div>
  );
}
