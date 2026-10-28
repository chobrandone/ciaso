import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';

export const runtime = 'nodejs';

/** Serves an event's flyer image stored in the database. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await queryOne<{ image: ArrayBuffer | null; image_type: string | null; updated_at: string }>(
    'SELECT image, image_type, updated_at FROM events WHERE id = ?', [Number(id)]
  );
  if (!row?.image) return new NextResponse('Not found', { status: 404 });
  return new NextResponse(new Uint8Array(row.image), {
    headers: {
      'Content-Type': row.image_type || 'image/jpeg',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
