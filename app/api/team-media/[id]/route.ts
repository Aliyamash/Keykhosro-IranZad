import { NextResponse } from 'next/server';
import { database } from '@/lib/inquiries';
import { teamMediaBucket } from '@/lib/team';

export const runtime = 'edge';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const row = await database()
    .prepare(
      'SELECT object_key, content_type FROM team_members WHERE id=? AND active=1',
    )
    .bind(id)
    .first<{ object_key: string; content_type: string }>();

  if (!row?.object_key) return new NextResponse('Not found', { status: 404 });
  const object = await teamMediaBucket().get(row.object_key);
  if (!object) return new NextResponse('Not found', { status: 404 });

  return new NextResponse(object.body, {
    headers: {
      'Content-Type': row.content_type,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      ETag: object.httpEtag,
    },
  });
}
