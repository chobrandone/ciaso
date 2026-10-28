/** Deployment-level settings. All editable organisation details live in the database (admin → Website content). */
export const site = {
  url: (process.env.SITE_URL || 'https://ciaso.ca').replace(/\/$/, '')
} as const;

export type NavItem = { href: string; label: string; children?: { href: string; label: string; hint?: string }[] };

/** Main menu: the same tabs as ciaso.ca (Home, About, FAQ, Testimonial, Services, Volunteer, Workshop, Events, Contact). */
export const nav: NavItem[] = [
  { href: '/', label: 'Home' },
  {
    href: '/about', label: 'About',
    children: [
      { href: '/about', label: 'About CIASO', hint: 'Who we are and what we stand for' },
      { href: '/faq', label: 'FAQ', hint: 'Common questions, answered' },
      { href: '/testimonial', label: 'Testimonial', hint: '#FromHereToThrive stories' }
    ]
  },
  {
    href: '/services', label: 'Services',
    children: [
      { href: '/services', label: 'All services', hint: 'Five pillars of support' },
      { href: '/services#settle', label: 'Settle' },
      { href: '/services#work', label: 'Work' },
      { href: '/services#grow', label: 'Grow' },
      { href: '/services#belong', label: 'Belong' },
      { href: '/services#thrive', label: 'Thrive' },
      { href: '/services#journey', label: 'Your CIASO Journey' }
    ]
  },
  { href: '/volunteer', label: 'Volunteer' },
  { href: '/workshop', label: 'Workshop' },
  {
    href: '/events', label: 'Events',
    children: [
      { href: '/events', label: 'Current events', hint: 'Upcoming workshops and events' },
      { href: '/events/past', label: 'Past events', hint: 'Recaps and earlier sessions' }
    ]
  },
  { href: '/contact', label: 'Contact' }
];
