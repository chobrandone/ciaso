import { z } from 'zod';

const trimmed = (max: number) => z.string().trim().max(max);
const optional = (max: number) => trimmed(max).optional().transform((v) => (v ? v : null));
const phone = z.string().trim().max(20).regex(/^[+()\-.\s\d]*$/, 'Enter a phone number using digits.').optional().transform((v) => (v ? v : null));

const base = {
  name: trimmed(120).min(1, 'Please enter your name.'),
  email: trimmed(160).email('Enter an email address in the format name@example.com.'),
  phone,
  consent: z.literal('on', { message: 'Please confirm the consent statement.' }),
  website: z.string().max(0).optional(), // honeypot – must be empty
  startedAt: z.coerce.number().optional()
};

export const supportNeeds = ['settle', 'work', 'grow', 'belong', 'thrive', 'other'] as const;
export const contactTopics = ['basic-needs', 'esl', 'entrepreneurship', 'employment', 'youth-elderly', 'personal-development', 'counselling', 'events', 'story', 'volunteer', 'partner', 'donate', 'general'] as const;
export const partnerTypes = ['employer', 'government', 'funder', 'education', 'community', 'mentor', 'donor', 'other'] as const;
export const volunteerInterests = ['Mentoring', 'Language support', 'Event coordination', 'Administrative assistance', 'Something else'] as const;

export const submissionSchemas = {
  support: z.object({
    ...base,
    topic: z.enum(supportNeeds, { message: 'Please choose what you need help with.' }),
    contact_preference: z.enum(['email', 'phone']).optional(),
    message: trimmed(3000).min(1, 'Please tell us a little about what you need.')
  }),
  contact: z.object({
    ...base,
    topic: z.enum(contactTopics, { message: 'Please choose a topic.' }),
    message: trimmed(3000).min(1, 'Please enter your message.')
  }),
  volunteer: z.object({
    ...base,
    interests: z.array(z.enum(volunteerInterests)).min(1, 'Please choose at least one way you’d like to help.'),
    message: optional(3000)
  }),
  partner: z.object({
    ...base,
    organization: trimmed(160).min(1, 'Please enter your organization’s name.'),
    topic: z.enum(partnerTypes, { message: 'Please choose a type of partnership.' }),
    message: trimmed(3000).min(1, 'Please tell us a little about your idea.')
  })
} as const;

export type SubmissionType = keyof typeof submissionSchemas;

export const labels = {
  type: { support: 'Support request', contact: 'Contact message', volunteer: 'Volunteer application', partner: 'Partnership enquiry' } as Record<string, string>,
  status: { new: 'New', in_progress: 'In progress', closed: 'Closed' } as Record<string, string>,
  topic: {
    settle: 'Settling in Canada', work: 'Finding employment', grow: 'Skills, education or business', belong: 'Connecting with community',
    thrive: 'Family & wellbeing support', other: 'Something else / not sure',
    'basic-needs': 'Basic necessities support', esl: 'English as a Second Language (ESL)', entrepreneurship: 'Entrepreneurship training',
    employment: 'Job training & employment support', 'youth-elderly': 'Youth, minority & elderly support programs',
    'personal-development': 'Social & personal development programs', counselling: 'Counselling & wellness', events: 'Workshops & events',
    story: 'Sharing my story', volunteer: 'Volunteering', partner: 'Partner with CIASO', donate: 'Donating to CIASO', general: 'General question',
    employer: 'Employer / corporate partner', government: 'Government / public sector', funder: 'Foundation / funder',
    education: 'School / educational institution', community: 'Community or faith-based organization', mentor: 'Mentor / professional', donor: 'Donation'
  } as Record<string, string>
};
