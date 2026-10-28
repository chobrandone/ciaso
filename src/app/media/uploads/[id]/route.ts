import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export const runtime = 'nodejs';

/** Serves an image uploaded through Website content (e.g. a page header photo). */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await queryOne<{ data: ArrayBuffer; mime: string }>('SELECT data, mime FROM uploads WHERE id = ?', [Number(id)]);
  if (!row) return new NextResponse('Not found', { status: 404 });
  return new NextResponse(new Uint8Array(row.data), {
    headers: { 'Content-Type': row.mime, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' }
  });
}
