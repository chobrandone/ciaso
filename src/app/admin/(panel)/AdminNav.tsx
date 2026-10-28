'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon, { type IconName } from '@/components/Icon';

export default function AdminNav({ newCount }: { newCount: number }) {
  const pathname = usePathname();
  const items: { href: string; label: string; icon: IconName; count?: number }[] = [
    { href: '/admin', label: 'Dashboard', icon: 'dashboard' },
    { href: '/admin/submissions', label: 'Enquiries', icon: 'inbox', count: newCount },
    { href: '/admin/content', label: 'Website content', icon: 'globe' },
    { href: '/admin/events', label: 'Events', icon: 'calendar' },
    { href: '/admin/stories', label: 'Stories', icon: 'quote' },
    { href: '/admin/videos', label: 'Videos', icon: 'video' },
    { href: '/admin/account', label: 'Account & admins', icon: 'key' }
  ];
  const active = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));
  return (
    <nav aria-label="Admin">
      <ul className="admin-nav">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} aria-current={active(i.href) ? 'page' : undefined}>
              <Icon name={i.icon} />{i.label}
              {!!i.count && <span className="count" aria-label={`${i.count} new`}>{i.count}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
