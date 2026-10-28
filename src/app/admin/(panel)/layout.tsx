import Image from 'next/image';
import Link from 'next/link';
import AdminNav from './AdminNav';
import Icon from '@/components/Icon';
import { requireAdmin } from '@/lib/auth';
import { queryOne } from '@/lib/db';
import { getContent } from '@/lib/content';
import { logoutAction } from '../actions';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const { images } = await getContent();
  const row = await queryOne<{ n: number }>("SELECT COUNT(*) AS n FROM submissions WHERE status = 'new'");
  return (
    <div className="admin">
      <a className="skip-link" href="#admin-main">Skip to main content</a>
      <aside className="admin-side">
        <Link className="admin-side__brand" href="/admin">
          <Image src={images.logo} width={174} height={91} alt="" unoptimized={!images.logo.startsWith('/images/')} />
          <span>Admin<small>CIASO website</small></span>
        </Link>
        <AdminNav newCount={Number(row?.n ?? 0)} />
        <div className="admin-side__foot">
          <a href="/" target="_blank" rel="noopener">View website ↗</a>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-top">
          <span className="note" style={{ margin: 0 }}>Canada Integration and Settlement Organization</span>
          <div className="admin-top__user">
            <span>Signed in as <strong>{session.name}</strong></span>
            <form action={logoutAction}><button className="btn btn--secondary btn--sm" type="submit"><Icon name="logout" />Sign out</button></form>
          </div>
        </header>
        <main id="admin-main" className="admin-content" tabIndex={-1}>{children}</main>
      </div>
    </div>
  );
}
