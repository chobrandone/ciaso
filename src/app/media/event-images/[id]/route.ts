import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export const runtime = 'nodejs';

/** Serves an event gallery photo stored in the database. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await queryOne<{ data: ArrayBuffer; mime: string }>('SELECT data, mime FROM event_images WHERE id = ?', [Number(id)]);
  if (!row) return new NextResponse('Not found', { status: 404 });
  return new NextResponse(new Uint8Array(row.data), {
    headers: {
      'Content-Type': row.mime,
      'Cache-Control': 'public, max-age=86400, immutable',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
