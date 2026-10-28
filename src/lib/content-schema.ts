// Every piece of editable website content: field definitions (used by the admin editor)
// and default values (used until an admin saves a change). Stored per section in `site_content`.

export type ScalarType = 'text' | 'textarea' | 'url' | 'email' | 'tel' | 'lines' | 'image' | 'select';
export type SubField = { key: string; label: string; type: ScalarType; hint?: string; options?: readonly (readonly [string, string])[] };
export type GroupField = { key: string; label: string; type: 'group'; hint?: string; fields: SubField[] };
export type RepeatField = { key: string; label: string; type: 'repeat'; hint?: string; itemLabel: string; fields: SubField[]; fixed?: boolean; titleKey?: string };
export type Field = SubField | GroupField | RepeatField;
export type Section = { id: SectionId; title: string; group: string; description: string; fields: Field[]; preview?: string };

export const ICON_OPTIONS = [
  ['settle', 'House'], ['work', 'Briefcase'], ['grow', 'Sprout'], ['belong', 'People'], ['thrive', 'Star'], ['building', 'Building'],
  ['school', 'School'], ['community', 'Community'], ['landmark', 'Landmark'], ['mentor', 'Mentor'], ['heart', 'Heart'], ['handshake', 'Handshake'],
  ['gift', 'Gift'], ['globe', 'Globe'], ['calendar', 'Calendar']
] as const;

const IMAGES = { community: '/images/community-group-1600.jpg', newcomers: '/images/newcomers-arriving-1024.jpg', professional: '/images/professional-1024.jpg' };

/** Fields shared by every inner-page header. */
const headerFields: SubField[] = [
  { key: 'eyebrow', label: 'Small label above the title', type: 'text' },
  { key: 'title', label: 'Page title', type: 'text' },
  { key: 'lead', label: 'Introduction', type: 'textarea' },
  { key: 'image', label: 'Header background image (shown blurred)', type: 'image' },
  { key: 'seoDescription', label: 'Search engine description', type: 'textarea', hint: 'Shown in Google results. About 150 characters.' }
];
const header = (eyebrow: string, title: string, lead: string, image: string, seoDescription: string) => ({ eyebrow, title, lead, image, seoDescription });

export const defaults = {
  contact: {
    orgName: 'Canada Integration and Settlement Organization',
    email: 'admin@ciaso.ca',
    phone1: '587-813-5155',
    phone2: '204-228-4625',
    hours: 'Monday–Friday, 9 a.m.–5 p.m.',
    street: '19716 28 Ave NW',
    city: 'Edmonton',
    region: 'AB',
    postal: 'T6M 1M1',
    mapUrl: 'https://share.google/tHUGhfeykzWz742th',
    frenchUrl: 'https://ciaso.ca/home-francais/',
    linkedin: 'https://www.linkedin.com/company/ciaso/',
    facebook: 'https://www.facebook.com/share/1TfgWEkRNP/',
    youtube: 'https://www.youtube.com/@CanadaIntegrationandSettlement'
  },
  brand: {
    position: 'From Newcomer to Thriving Canadian',
    promise: 'We don’t just help newcomers settle in Canada. We help them build a future.',
    statement: 'CIASO is more than a settlement organization. We are a bridge between newcomers and opportunity – connecting individuals and families to the resources, skills, relationships and support they need to build meaningful, confident and successful lives in Canada.',
    campaign: ['From arrival to opportunity.', 'From opportunity to impact.'],
    summary: 'CIASO helps newcomers settle, connect, grow, and thrive.',
    whoWeAre: 'Helping newcomers and families build successful lives in Canada.',
    whoWeHelp: ['Newcomers', 'Families', 'Students', 'Professionals', 'Entrepreneurs'],
    connector: 'CIASO connects newcomers to the people, resources, skills and opportunities they need to thrive.',
    hashtag: '#FromHereToThrive'
  },
  home: {
    seoTitle: 'CIASO | Newcomer Support in Alberta – Settlement, Employment & Community',
    seoDescription: 'CIASO is an Alberta nonprofit connecting newcomers and families to settlement support, employment and skills programs, mentorship and community – so they can build a future in Canada.',
    heroEyebrow: 'Canada Integration and Settlement Organization',
    heroLine1: 'From newcomer',
    heroLine2: 'to thriving',
    heroAccent: 'Canadian.',
    heroImage: IMAGES.community,
    panelTitle: 'How can we help today?',
    introEyebrow: 'Who we are',
    whoWeHelpLabel: 'Who we help',
    pillarsEyebrow: 'How we help',
    pillarsTitle: 'Settle. Work. Grow. Belong. Thrive.',
    journeyEyebrow: 'Your CIASO Journey',
    journeyTitle: 'Discover → Connect → Equip → Work → Grow → Thrive',
    storiesTitle: 'Real journeys. New possibilities.',
    connectorEyebrow: 'Community connector',
    connectorTitle: 'Opportunity grows when we connect.',
    eventsEyebrow: 'Events & workshops',
    eventsTitleUpcoming: 'Coming up at CIASO.',
    eventsTitleRecent: 'Recent CIASO events.',
    eventsTextRecent: 'New events are announced regularly. Here are our most recent sessions.'
  },
  pillars: {
    intro: 'Our services are organized into five pillars.',
    items: [
      { name: 'Settle', items: ['Basic necessities', 'Settlement support', 'Community resources', 'Family support'] },
      { name: 'Work', items: ['Job search', 'Resume and cover letter support', 'Interview preparation', 'Employment training', 'Career development'] },
      { name: 'Grow', items: ['Education', 'Tutoring', 'Skills development', 'Entrepreneurship', 'Professional development'] },
      { name: 'Belong', items: ['Networking', 'Mentorship', 'Community events', 'Volunteer opportunities', 'Cultural connections'] },
      { name: 'Thrive', items: ['Wellness', 'Confidence', 'Leadership', 'Economic empowerment', 'Long-term integration'] }
    ]
  },
  journey: {
    note: 'Every journey is different. Start at any stage and move at your own pace.',
    steps: [
      { name: 'Discover', text: 'Understand your new environment.' },
      { name: 'Connect', text: 'Find community and resources.' },
      { name: 'Equip', text: 'Gain skills, knowledge and confidence.' },
      { name: 'Work', text: 'Build your career and economic independence.' },
      { name: 'Grow', text: 'Develop personally and professionally.' },
      { name: 'Thrive', text: 'Become an active, confident contributor to your community.' }
    ]
  },
  connector: {
    items: [
      { icon: 'building', partner: 'Employers', outcome: 'Employment opportunities' },
      { icon: 'school', partner: 'Schools', outcome: 'Education opportunities' },
      { icon: 'work', partner: 'Businesses', outcome: 'Entrepreneurship and economic development' },
      { icon: 'community', partner: 'Community organizations', outcome: 'Settlement and family support' },
      { icon: 'landmark', partner: 'Faith-based organizations', outcome: '' },
      { icon: 'mentor', partner: 'Professionals', outcome: 'Mentorship' },
      { icon: 'heart', partner: 'Volunteers', outcome: 'Community connection' }
    ]
  },
  cta: {
    eyebrow: 'What should I do next?',
    title: 'Your next step starts here.',
    text: 'From arrival to opportunity. From opportunity to impact.',
    items: [
      { label: 'Get Support', hint: 'Tell us what you need help with', href: '/get-support' },
      { label: 'Join a Program', hint: 'Workshops and upcoming events', href: '/events' },
      { label: 'Volunteer', hint: 'Give your time and skills', href: '/volunteer' },
      { label: 'Partner With Us', hint: 'Employers, schools, organizations', href: '/contact?topic=partner' },
      { label: 'Donate', hint: 'Support newcomer families', href: '/contact?topic=donate' }
    ]
  },
  about: {
    header: header('About CIASO', 'From Newcomer to Thriving Canadian', 'We don’t just help newcomers settle in Canada. We help them build a future.', IMAGES.community,
      'CIASO is more than a settlement organization. We are a bridge between newcomers and opportunity, helping newcomers and families build successful lives in Canada.'),
    whoTitle: 'A bridge between newcomers and opportunity.',
    vision: 'Our vision is a welcoming, inclusive society where every newcomer and their family thrives with dignity, confidence, and connection – where their skills are recognized and their contributions are valued.',
    whyEyebrow: 'Why CIASO',
    whyTitle: 'Removing barriers to a full life in Canada.',
    mission: 'CIASO helps remove barriers that prevent newcomers and their families from fully participating in Canadian society and the economy.',
    problem: 'Individuals and families face barriers to employment, integration, community connection and economic participation.',
    solution: 'CIASO provides coordinated support.',
    outcome: 'Individuals and families become connected, skilled, employed, confident and contributing members of Canadian communities.',
    journeyTitle: 'Our signature framework.',
    connectTitle: 'We don’t just provide services. We connect.'
  },
  services: {
    header: header('Our services', 'Five pillars. One goal: your future.', 'CIASO helps newcomers settle, connect, grow, and thrive.', IMAGES.newcomers,
      'CIASO’s services for newcomers in five pillars: settlement support, employment, education and skills, community connection, and long-term wellbeing.')
  },
  faq: {
    header: header('FAQ', 'Common questions, answered.', 'Everything you need to know about getting started with CIASO.', IMAGES.newcomers,
      'Answers to common questions about CIASO: who we are, who can access our services, how to get started, employment support and wellness programs.'),
    items: [
      { question: 'What is CIASO?', answer: 'CIASO (Canada Integration and Settlement Organization) is a nonprofit based in Alberta dedicated to supporting newcomers and Canadians. We help individuals and families feel safe, supported, and empowered to thrive in their community.' },
      { question: 'What is the consultation process like?', answer: 'Our consultation process begins with understanding your goals and personal situation. We then guide you step by step through the best options.' },
      { question: 'Can CIASO help with mental health or family challenges?', answer: 'Absolutely. We provide counselling, group sessions and wellness programs to help individuals and families overcome challenges and build resilience.' },
      { question: 'How do I get started with your services?', answer: 'You can get started by contacting our team through our website or office. We’ll schedule a consultation to assess your needs and connect you to the right support.' },
      { question: 'Who can access CIASO’s services?', answer: 'Our programs are available to newcomers, families, youth, minorities, the elderly, and anyone seeking support with settlement, integration, personal growth, or wellness in Alberta.' },
      { question: 'How can I get help with employment or job training?', answer: 'CIASO offers programs for skills development, employment training, and placement. Contact us to find out which program best fits your needs and how to enroll.' }
    ]
  },
  testimonial: {
    header: header('#FromHereToThrive', 'Real journeys. New possibilities.', 'From newcomer to confident professional. Stories from the CIASO community, in their own words.', IMAGES.professional,
      'Real journeys, new possibilities. Hear from newcomers who built confidence, careers and community with CIASO. #FromHereToThrive'),
    shareTitle: 'Share your journey.',
    shareText: 'Has CIASO been part of your journey? Your story can show another newcomer what is possible. We always ask your permission before publishing.'
  },
  volunteer: {
    header: header('Volunteer', 'Help a newcomer feel at home.', 'CIASO + Volunteers → Community connection. Your time and skills help families and individuals build brighter futures in Canada.', IMAGES.professional,
      'Volunteers help newcomers feel at home in Canada through mentoring, language support, event coordination and administrative assistance. Apply to volunteer with CIASO.'),
    eyebrow: 'About CIASO volunteers',
    title: 'Your contribution makes a real difference.',
    text: 'Volunteers play a vital role in helping newcomers feel at home in Canada. By giving your time and skills, you support families and individuals as they adjust to a new culture, find resources and build brighter futures.',
    roles: ['Mentoring', 'Language support', 'Event coordination', 'Administrative assistance'],
    closing: 'Together, we create a welcoming community where every newcomer feels supported and empowered.',
    formTitle: 'Volunteer application'
  },
  workshop: {
    header: header('Workshops', 'Gain skills, knowledge and confidence.', 'Practical CIASO workshops on job search, career development, entrepreneurship and life in Canada.', IMAGES.professional,
      'CIASO workshops for newcomers: job search, resumes and cover letters, interviews, LinkedIn, Canadian experience, healthcare careers and entrepreneurship.'),
    upcomingTitle: 'Upcoming workshops.',
    pastTitle: 'Recent sessions.'
  },
  events: {
    header: header('Events', 'Current events.', 'Join a program. Free, practical sessions on careers, settlement, entrepreneurship and community – online and in Edmonton.', IMAGES.community,
      'Upcoming CIASO events and workshops for newcomers: career, settlement, entrepreneurship and community networking.'),
    pastHeader: header('Events', 'Past events.', 'A look back at CIASO workshops and community events. Open any event for the full details, flyer and photos.', IMAGES.newcomers,
      'Earlier CIASO events and workshops: resume and cover letter masterclasses, LinkedIn, healthcare careers, Canadian experience, entrepreneurship and community networking.'),
    emptyTitle: 'New events are being planned',
    emptyText: 'There are no upcoming events right now. Follow CIASO on social media for announcements, or contact us to ask about the next session.'
  },
  contactPage: {
    header: header('Contact', 'We’re here to support your journey.', 'Whether you have questions about our programs, need assistance, or want to learn more about how CIASO can help, our team is ready to connect with you.', IMAGES.professional,
      'Contact the Canada Integration and Settlement Organization (CIASO) in Edmonton, Alberta. Call, email or send us a message.'),
    formTitle: 'Send us a message',
    detailsTitle: 'Contact details'
  },
  getSupport: {
    header: header('Get support', 'How can we help you today?', 'Getting help should be simple. Choose what you need, see how CIASO can support you, then send us a short message. A member of our team will review it and contact you.', IMAGES.community,
      'Tell CIASO what you need help with – settling, work, learning, community or wellbeing – and our team will follow up.'),
    needTitle: 'What do you need help with?',
    formTitle: 'Request support',
    successText: 'A member of the CIASO team will review your message and contact you.'
  },
  accessibility: {
    header: header('Accessibility', 'A website for everyone.', 'CIASO serves people with many different backgrounds, languages and abilities. We want this website to be easy for everyone to use.', IMAGES.community,
      'How the CIASO website is designed to be accessible, and how to tell us about a barrier you encounter.'),
    body: `## What we’ve done
This website was designed with the Web Content Accessibility Guidelines (WCAG) 2.2, level AA, as our target. This includes:
- Plain language and short paragraphs
- Text and button colours with strong contrast
- Full keyboard navigation and visible focus outlines
- Clear headings and page structure for screen readers
- Forms with clear labels and helpful error messages
- Layouts that work on phones, tablets and computers, and animations that switch off when your device asks for reduced motion

## Tell us about a barrier
If something on this website is hard to use, or you need information in another format, please email or call us. We welcome your feedback.`
  },
  images: {
    logo: '/images/ciaso-logo.png',
    homeIntroImage: '/images/newcomers-arriving-1024.jpg',
    homeIntroAlt: 'A group of young adults with backpacks standing together outdoors, smiling',
    aboutImage: '/images/community-group-800.jpg',
    aboutAlt: 'A diverse group of smiling adults standing together',
    shareImage: '/images/og-image.jpg'
  },
  partners: {
    show: 'yes',
    eyebrow: 'Working together',
    title: 'Our partners.',
    text: 'CIASO works alongside community, business and faith-based organizations to create more opportunities for newcomers.',
    items: [
      { name: 'ACANEA – Association des Entrepreneurs Afro-Canadiens', logo: '/images/partners/acanea.png', url: '' },
      { name: 'Success Skills Centre', logo: '/images/partners/success-skills-centre.png', url: '' },
      { name: 'The Guiding Light Women Empowerment Society', logo: '/images/partners/guiding-light-women.png', url: '' },
      { name: 'CEHLAF', logo: '/images/partners/cehlaf.jpg', url: '' },
      { name: 'Presbyterian Christian Fellowship in Canada', logo: '/images/partners/presbyterian-christian-fellowship.jpg', url: '' },
      { name: 'Diversity Veteran F.C. Edmonton', logo: '/images/partners/diversity-veteran-fc.jpg', url: '' }
    ]
  },
  nav: {
    items: [
      { label: 'Home', href: '/', children: [] as string[] },
      { label: 'About', href: '/about', children: ['About CIASO | /about | Who we are and what we stand for', 'FAQ | /faq | Common questions, answered', 'Testimonial | /testimonial | #FromHereToThrive stories'] },
      { label: 'Services', href: '/services', children: [] as string[] },
      { label: 'Volunteer', href: '/volunteer', children: [] as string[] },
      { label: 'Workshop', href: '/workshop', children: [] as string[] },
      { label: 'Events', href: '/events', children: ['Current events | /events | Upcoming workshops and events', 'Past events | /events/past | Recaps and earlier sessions'] },
      { label: 'Contact', href: '/contact', children: [] as string[] }
    ],
    ctaLabel: 'Get Support',
    ctaHref: '/get-support'
  },
  emails: {
    autoReplySubject: 'We’ve received your request – CIASO',
    autoReplyBody: `Hi {name},

Thank you for reaching out to CIASO. We’ve received your request regarding {service}, and our team is already reviewing it. One of our representatives will get back to you within two business days with the next steps.

In the meantime, you’re welcome to explore our website at ciaso.ca or contact us directly at admin@ciaso.ca if your request is urgent.

We appreciate your interest in CIASO and look forward to assisting you with {service}.

Best regards,
Leonard Ngwa
Administrator
CIASO
admin@ciaso.ca`,
    adminSubject: 'New {form} from {name} – {service}',
    popupTitle: 'Congratulations!',
    popupText: 'Your message has been sent to CIASO. Our team will get back to you within two business days.',
    popupEmailText: 'We’ve also sent a confirmation email to {email}.'
  },
  footer: {
    text: 'Helping newcomers and families build successful lives in Canada. CIASO helps newcomers settle, connect, grow, and thrive.',
    copyright: 'Canada Integration and Settlement Organization (CIASO). All rights reserved.'
  }
};

export type Content = typeof defaults;
export type SectionId = keyof Content;

export const sections: Section[] = [
  { id: 'contact', group: 'Organization', title: 'Contact details & social links', description: 'Shown in the top bar, footer, contact page and forms.', fields: [
    { key: 'orgName', label: 'Organization name', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone1', label: 'Main phone', type: 'tel' },
    { key: 'phone2', label: 'Second phone (optional)', type: 'tel' },
    { key: 'hours', label: 'Office hours', type: 'text' },
    { key: 'street', label: 'Street address', type: 'text' },
    { key: 'city', label: 'City', type: 'text' },
    { key: 'region', label: 'Province', type: 'text' },
    { key: 'postal', label: 'Postal code', type: 'text' },
    { key: 'mapUrl', label: 'Map / directions link', type: 'url' },
    { key: 'frenchUrl', label: '“Français” link', type: 'url' },
    { key: 'linkedin', label: 'LinkedIn', type: 'url' },
    { key: 'facebook', label: 'Facebook', type: 'url' },
    { key: 'youtube', label: 'YouTube channel', type: 'url' }
  ] },
  { id: 'brand', group: 'Organization', title: 'Brand messages', description: 'Brand promise, positioning statement and campaign lines used across the site.', fields: [
    { key: 'position', label: 'Brand position', type: 'text' },
    { key: 'promise', label: 'Brand promise', type: 'textarea' },
    { key: 'statement', label: 'Positioning statement', type: 'textarea' },
    { key: 'campaign', label: 'Campaign lines (one per line)', type: 'lines' },
    { key: 'summary', label: 'One-line summary', type: 'text' },
    { key: 'whoWeAre', label: 'Who we are (headline)', type: 'text' },
    { key: 'whoWeHelp', label: 'Who we help (one per line)', type: 'lines' },
    { key: 'connector', label: 'Community connector statement', type: 'textarea' },
    { key: 'hashtag', label: 'Campaign hashtag', type: 'text' }
  ] },
  { id: 'home', group: 'Pages', title: 'Home page', description: 'Hero, section headings and search listing for the home page.', preview: '/', fields: [
    { key: 'seoTitle', label: 'Browser / search title', type: 'text' },
    { key: 'seoDescription', label: 'Search engine description', type: 'textarea' },
    { key: 'heroEyebrow', label: 'Hero: small label', type: 'text' },
    { key: 'heroLine1', label: 'Hero title: line 1', type: 'text' },
    { key: 'heroLine2', label: 'Hero title: line 2', type: 'text' },
    { key: 'heroAccent', label: 'Hero title: red line', type: 'text' },
    { key: 'heroImage', label: 'Hero background image (shown blurred)', type: 'image' },
    { key: 'panelTitle', label: 'Hero panel title', type: 'text' },
    { key: 'introEyebrow', label: '“Who we are” label', type: 'text' },
    { key: 'whoWeHelpLabel', label: '“Who we help” label', type: 'text' },
    { key: 'pillarsEyebrow', label: 'Pillars: label', type: 'text' },
    { key: 'pillarsTitle', label: 'Pillars: title', type: 'text' },
    { key: 'journeyEyebrow', label: 'Journey: label', type: 'text' },
    { key: 'journeyTitle', label: 'Journey: title', type: 'text' },
    { key: 'storiesTitle', label: 'Stories: title', type: 'text' },
    { key: 'connectorEyebrow', label: 'Connector: label', type: 'text' },
    { key: 'connectorTitle', label: 'Connector: title', type: 'text' },
    { key: 'eventsEyebrow', label: 'Events: label', type: 'text' },
    { key: 'eventsTitleUpcoming', label: 'Events: title when events are coming up', type: 'text' },
    { key: 'eventsTitleRecent', label: 'Events: title when showing recent events', type: 'text' },
    { key: 'eventsTextRecent', label: 'Events: text when showing recent events', type: 'textarea' }
  ] },
  { id: 'pillars', group: 'Services', title: 'Five pillars & services', description: 'The pillar names and the services listed under each (Home, Services, Get Support).', preview: '/services', fields: [
    { key: 'intro', label: 'Introduction', type: 'text' },
    { key: 'items', label: 'Pillars', type: 'repeat', itemLabel: 'Pillar', fixed: true, titleKey: 'name', fields: [
      { key: 'name', label: 'Pillar name', type: 'text' },
      { key: 'items', label: 'Services (one per line)', type: 'lines' }
    ] }
  ] },
  { id: 'journey', group: 'Services', title: 'Your CIASO Journey', description: 'The six stages shown on Home, About and Services.', preview: '/services#journey', fields: [
    { key: 'note', label: 'Note under the journey', type: 'text' },
    { key: 'steps', label: 'Stages', type: 'repeat', itemLabel: 'Stage', fixed: true, titleKey: 'name', fields: [
      { key: 'name', label: 'Stage name', type: 'text' },
      { key: 'text', label: 'Description', type: 'text' }
    ] }
  ] },
  { id: 'connector', group: 'Services', title: 'Community connector', description: 'CIASO + partner → outcome (Home and About).', fields: [
    { key: 'items', label: 'Connections', type: 'repeat', itemLabel: 'Connection', titleKey: 'partner', fields: [
      { key: 'partner', label: 'Partner (after “CIASO +”)', type: 'text' },
      { key: 'outcome', label: 'Outcome (optional)', type: 'text' },
      { key: 'icon', label: 'Icon', type: 'select', options: ICON_OPTIONS }
    ] }
  ] },
  { id: 'cta', group: 'Services', title: '“What should I do next?” buttons', description: 'The call-to-action panel at the bottom of most pages.', fields: [
    { key: 'eyebrow', label: 'Label', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'items', label: 'Buttons', type: 'repeat', itemLabel: 'Button', titleKey: 'label', fields: [
      { key: 'label', label: 'Button text', type: 'text' },
      { key: 'hint', label: 'Small text', type: 'text' },
      { key: 'href', label: 'Link (e.g. /volunteer)', type: 'url' }
    ] }
  ] },
  { id: 'about', group: 'Pages', title: 'About page', description: '', preview: '/about', fields: [
    { key: 'header', label: 'Page header', type: 'group', fields: headerFields },
    { key: 'whoTitle', label: '“Who we are” title', type: 'text' },
    { key: 'vision', label: 'Vision', type: 'textarea' },
    { key: 'whyEyebrow', label: 'Why CIASO: label', type: 'text' },
    { key: 'whyTitle', label: 'Why CIASO: title', type: 'text' },
    { key: 'mission', label: 'Why CIASO: mission', type: 'textarea' },
    { key: 'problem', label: 'The problem', type: 'textarea' },
    { key: 'solution', label: 'The solution', type: 'textarea' },
    { key: 'outcome', label: 'The outcome', type: 'textarea' },
    { key: 'journeyTitle', label: 'Journey section title', type: 'text' },
    { key: 'connectTitle', label: 'Connector section title', type: 'text' }
  ] },
  { id: 'services', group: 'Pages', title: 'Services page', description: 'Header for the Services page (the pillars themselves are under “Five pillars & services”).', preview: '/services', fields: [
    { key: 'header', label: 'Page header', type: 'group', fields: headerFields }
  ] },
  { id: 'faq', group: 'Pages', title: 'FAQ page', description: 'Questions and answers.', preview: '/faq', fields: [
    { key: 'header', label: 'Page header', type: 'group', fields: headerFields },
    { key: 'items', label: 'Questions', type: 'repeat', itemLabel: 'Question', titleKey: 'question', fields: [
      { key: 'question', label: 'Question', type: 'text' },
      { key: 'answer', label: 'Answer', type: 'textarea' }
    ] }
  ] },
  { id: 'testimonial', group: 'Pages', title: 'Testimonial page', description: 'Header and “share your story” text. Testimonials themselves are under Stories.', preview: '/testimonial', fields: [
    { key: 'header', label: 'Page header', type: 'group', fields: headerFields },
    { key: 'shareTitle', label: 'Share your story: title', type: 'text' },
    { key: 'shareText', label: 'Share your story: text', type: 'textarea' }
  ] },
  { id: 'volunteer', group: 'Pages', title: 'Volunteer page', description: '', preview: '/volunteer', fields: [
    { key: 'header', label: 'Page header', type: 'group', fields: headerFields },
    { key: 'eyebrow', label: 'Section label', type: 'text' },
    { key: 'title', label: 'Section title', type: 'text' },
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'roles', label: 'Ways to help (one per line)', type: 'lines' },
    { key: 'closing', label: 'Closing sentence', type: 'textarea' },
    { key: 'formTitle', label: 'Form title', type: 'text' }
  ] },
  { id: 'workshop', group: 'Pages', title: 'Workshop page', description: 'Workshops themselves are managed under Events.', preview: '/workshop', fields: [
    { key: 'header', label: 'Page header', type: 'group', fields: headerFields },
    { key: 'upcomingTitle', label: 'Upcoming section title', type: 'text' },
    { key: 'pastTitle', label: 'Past section title', type: 'text' }
  ] },
  { id: 'events', group: 'Pages', title: 'Events pages', description: 'Headers for Current and Past events. Events themselves are managed under Events.', preview: '/events', fields: [
    { key: 'header', label: 'Current events: header', type: 'group', fields: headerFields },
    { key: 'pastHeader', label: 'Past events: header', type: 'group', fields: headerFields },
    { key: 'emptyTitle', label: 'No current events: title', type: 'text' },
    { key: 'emptyText', label: 'No current events: text', type: 'textarea' }
  ] },
  { id: 'contactPage', group: 'Pages', title: 'Contact page', description: 'Contact details themselves are under “Contact details & social links”.', preview: '/contact', fields: [
    { key: 'header', label: 'Page header', type: 'group', fields: headerFields },
    { key: 'formTitle', label: 'Form title', type: 'text' },
    { key: 'detailsTitle', label: 'Details title', type: 'text' }
  ] },
  { id: 'getSupport', group: 'Pages', title: 'Get Support page', description: '', preview: '/get-support', fields: [
    { key: 'header', label: 'Page header', type: 'group', fields: headerFields },
    { key: 'needTitle', label: 'Question above the choices', type: 'text' },
    { key: 'formTitle', label: 'Form title', type: 'text' },
    { key: 'successText', label: 'Message after sending', type: 'textarea' }
  ] },
  { id: 'accessibility', group: 'Pages', title: 'Accessibility page', description: '', preview: '/accessibility', fields: [
    { key: 'header', label: 'Page header', type: 'group', fields: headerFields },
    { key: 'body', label: 'Page text', type: 'textarea', hint: 'Blank line between paragraphs. “## ” starts a heading, “- ” a bullet point.' }
  ] },
  { id: 'nav', group: 'Organization', title: 'Navigation menu', description: 'The menu at the top of every page. Add, remove or reorder tabs; any tab with dropdown items becomes a dropdown.', fields: [
    { key: 'items', label: 'Menu tabs', type: 'repeat', itemLabel: 'Tab', titleKey: 'label', fields: [
      { key: 'label', label: 'Tab label', type: 'text' },
      { key: 'href', label: 'Link (e.g. /about)', type: 'url' },
      { key: 'children', label: 'Dropdown items (optional, one per line)', type: 'lines', hint: 'Format: Label | /link | short description (description optional). Leave empty for a plain tab.' }
    ] },
    { key: 'ctaLabel', label: 'Red button: text', type: 'text' },
    { key: 'ctaHref', label: 'Red button: link', type: 'url' }
  ] },
  { id: 'images', group: 'Organization', title: 'Logo & images', description: 'The logo (header, footer, loader, emails), photos used in “Who we are” when no video is set, and the image shown when the site is shared on social media. Page header images are edited on each page.', fields: [
    { key: 'logo', label: 'Logo', type: 'image' },
    { key: 'homeIntroImage', label: 'Home “Who we are” photo (shown if no Home video)', type: 'image' },
    { key: 'homeIntroAlt', label: 'Home photo description (for screen readers)', type: 'text' },
    { key: 'aboutImage', label: 'About “Who we are” photo (shown if no About video)', type: 'image' },
    { key: 'aboutAlt', label: 'About photo description (for screen readers)', type: 'text' },
    { key: 'shareImage', label: 'Social sharing image (LinkedIn, Facebook…)', type: 'image' }
  ] },
  { id: 'partners', group: 'Organization', title: 'Partner logos', description: 'Partner organizations shown on the Home and About pages. Add, remove or reorder partners and upload their logos.', preview: '/about', fields: [
    { key: 'show', label: 'Show the partners section', type: 'select', options: [['yes', 'Yes'], ['no', 'No']] },
    { key: 'eyebrow', label: 'Small label', type: 'text' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'text', label: 'Text', type: 'textarea' },
    { key: 'items', label: 'Partners', type: 'repeat', itemLabel: 'Partner', titleKey: 'name', fields: [
      { key: 'name', label: 'Organization name', type: 'text' },
      { key: 'logo', label: 'Logo', type: 'image' },
      { key: 'url', label: 'Website (optional)', type: 'url' }
    ] }
  ] },
  { id: 'emails', group: 'Organization', title: 'Emails & confirmation popup', description: 'The automatic reply sent to people who submit a form, the notification sent to CIASO, and the popup shown after sending.', fields: [
    { key: 'autoReplySubject', label: 'Automatic reply: subject', type: 'text' },
    { key: 'autoReplyBody', label: 'Automatic reply: message', type: 'textarea', hint: 'Use {name} for the person’s name and {service} for the service or topic they chose. Leave a blank line between paragraphs. “ciaso.ca” and “admin@ciaso.ca” become links automatically.' },
    { key: 'adminSubject', label: 'Notification to CIASO: subject', type: 'text', hint: 'Placeholders: {form}, {name}, {service}.' },
    { key: 'popupTitle', label: 'Popup: title', type: 'text' },
    { key: 'popupText', label: 'Popup: message', type: 'textarea' },
    { key: 'popupEmailText', label: 'Popup: line shown when the confirmation email was sent', type: 'text', hint: 'Use {email} for the address the confirmation was sent to.' }
  ] },
  { id: 'footer', group: 'Organization', title: 'Footer', description: '', fields: [
    { key: 'text', label: 'Footer text', type: 'textarea' },
    { key: 'copyright', label: 'Copyright line (after “© year”)', type: 'text' }
  ] }
];
