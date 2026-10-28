import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import type { SubmissionRow } from '@/lib/data';
import { buildSubmissionFilter } from '@/lib/submission-filter';
import { labels } from '@/lib/validation';

export const runtime = 'nodejs';

const cell = (v: unknown) => {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // prevent spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sp = Object.fromEntries(req.nextUrl.searchParams);
  const { sql, args } = buildSubmissionFilter(sp);
  const rows = await query<SubmissionRow>(`SELECT * FROM submissions ${sql} ORDER BY created_at DESC, id DESC`, args);
  const header = ['ID', 'Received (UTC)', 'Form', 'Status', 'Name', 'Email', 'Phone', 'Organization', 'Topic', 'Interests', 'Preferred contact', 'Message', 'Notes'];
  const lines = rows.map((r) => [
    r.id, r.created_at, labels.type[r.type], labels.status[r.status], r.name, r.email, r.phone, r.organization,
    r.topic ? labels.topic[r.topic] ?? r.topic : '', r.interests, r.contact_preference, r.message, r.notes
  ].map(cell).join(','));
  const csv = '﻿' + [header.map(cell).join(','), ...lines].join('\r\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ciaso-enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store'
    }
  });
}
