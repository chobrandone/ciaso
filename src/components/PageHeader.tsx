import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { delay } from '@/lib/ui';

export type HeaderContent = { eyebrow: string; title: string; lead: string; image: string };

/** Compact header used at the top of every inner page: blurred photo, dark overlay, animated text. */
export default function PageHeader({ header, crumb, children }: { header: HeaderContent; crumb: string; children?: ReactNode }) {
  return (
    <section className="page-header" aria-labelledby="page-title">
      {header.image && (
        <div className="page-header__bg" aria-hidden="true">
          <Image src={header.image} alt="" fill priority sizes="100vw" quality={60} unoptimized={!header.image.startsWith('/images/')} />
        </div>
      )}
      <div className="container">
        <nav className="breadcrumbs anim-in" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            <li><span aria-current="page">{crumb}</span></li>
          </ol>
        </nav>
        {header.eyebrow && <p className="eyebrow anim-up">{header.eyebrow}</p>}
        <h1 id="page-title" className="anim-up" style={delay(0.1)}>{header.title}</h1>
        {header.lead && <p className="page-header__lead anim-up" style={delay(0.2)}>{header.lead}</p>}
        {children && <div className="page-header__actions anim-up" style={delay(0.3)}>{children}</div>}
      </div>
    </section>
  );
}
