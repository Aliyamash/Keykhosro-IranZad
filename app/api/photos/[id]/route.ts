import { database } from '@/lib/inquiries';
import { mediaBucket } from '@/lib/photos';
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const row = await database()
    .prepare(
      'SELECT object_key, content_type FROM photos WHERE id=? AND deleted=0',
    )
    .bind(id)
    .first<{ object_key: string; content_type: string }>();
  if (!row) return new Response('Not found', { status: 404 });
  const object = await mediaBucket().get(row.object_key);
  if (!object) return new Response('Not found', { status: 404 });
  return new Response(object.body, {
    headers: {
      'Content-Type': row.content_type,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
    },
  });
}
