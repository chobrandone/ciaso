import { NextResponse, type NextRequest } from 'next/server';
import { execute } from '@/lib/db';
import { submissionSchemas, labels, type SubmissionType } from '@/lib/validation';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { sendSubmissionEmails } from '@/lib/mail';
import { getContent } from '@/lib/content';

export const runtime = 'nodejs';

function sameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (!origin) return true; // non-browser clients; still validated and rate-limited
  try { return new URL(origin).host === req.headers.get('host'); } catch { return false; }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (!(type in submissionSchemas)) return NextResponse.json({ error: 'Unknown form.' }, { status: 404 });
  if (!sameOrigin(req)) return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });

  if (!rateLimit(`sub:${type}:${clientIp(req.headers)}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many submissions from this connection. Please wait a few minutes, or email admin@ciaso.ca.' }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }); }

  const raw = (body ?? {}) as Record<string, unknown>;
  const isSpam = (typeof raw.website === 'string' && raw.website !== '') ||
    (Number(raw.startedAt) > 0 && Date.now() - Number(raw.startedAt) < 2500);
  // The honeypot is checked after validation, so drop it from what we validate
  const { website: _hp, ...fields } = raw;

  const parsed = submissionSchemas[type as SubmissionType].safeParse(fields);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form');
      if (key === 'website' || key === 'startedAt') continue;
      errors[key] ??= key === 'consent' ? 'Please confirm the consent statement.' : issue.message;
    }
    return NextResponse.json({ errors }, { status: 422 });
  }

  // Spam traps (honeypot filled or form completed implausibly fast): pretend success so bots learn nothing.
  if (isSpam) return NextResponse.json({ ok: true }, { status: 201 });

  const d = parsed.data as Record<string, unknown>;
  const row = {
    name: d.name as string,
    email: d.email as string,
    phone: (d.phone as string | null) ?? null,
    organization: (d.organization as string | undefined) ?? null,
    topic: (d.topic as string | undefined) ?? null,
    interests: Array.isArray(d.interests) ? (d.interests as string[]).join(', ') : null,
    contact_preference: (d.contact_preference as string | undefined) ?? null,
    message: (d.message as string | null) ?? null
  };

  const inserted = await execute(
    `INSERT INTO submissions (type, name, email, phone, organization, topic, interests, contact_preference, message)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [type, row.name, row.email, row.phone, row.organization, row.topic, row.interests, row.contact_preference, row.message]
  );

  // The service / topic the person chose, as it reads in the emails ("…regarding {service}")
  const service = type === 'volunteer'
    ? `volunteering with CIASO${row.interests ? ` (${row.interests})` : ''}`
    : row.topic ? labels.topic[row.topic] ?? row.topic : labels.type[type].toLowerCase();

  const { autoReplySent } = await sendSubmissionEmails({
    id: inserted.lastInsertId ?? 0,
    formLabel: labels.type[type],
    name: row.name,
    email: row.email,
    service,
    details: {
      Form: labels.type[type],
      Name: row.name,
      Email: row.email,
      Phone: row.phone,
      Organization: row.organization,
      Service: service,
      'Preferred contact': row.contact_preference,
      Message: row.message
    }
  });

  const { emails } = await getContent();
  return NextResponse.json({
    ok: true,
    emailSent: autoReplySent,
    popup: { title: emails.popupTitle, text: emails.popupText, emailText: emails.popupEmailText }
  }, { status: 201 });
}
