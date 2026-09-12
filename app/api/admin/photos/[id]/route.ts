import { adminIdentity } from '@/lib/admin';
import { database, validOrigin, privateHeaders } from '@/lib/inquiries';
import { defaultPhotos } from '@/lib/photo-types';
import { mediaBucket } from '@/lib/photos';
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await adminIdentity()) || !validOrigin(request))
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  const { id } = await context.params;
  const builtin = defaultPhotos.find((p) => p.id === id);
  if (builtin) {
    await database()
      .prepare(
        'INSERT INTO photos (id, section, title_fa, title_en, deleted, created_at) VALUES (?, ?, ?, ?, 1, ?) ON CONFLICT(id) DO UPDATE SET deleted=1',
      )
      .bind(id, builtin.section, builtin.title_fa, builtin.title_en, Date.now())
      .run();
  } else {
    const row = await database()
      .prepare('SELECT object_key FROM photos WHERE id=?')
      .bind(id)
      .first<{ object_key: string }>();
    if (!row) return Response.json({ error: 'Not found' }, { status: 404 });
    await database()
      .prepare('UPDATE photos SET deleted=1 WHERE id=?')
      .bind(id)
      .run();
    await mediaBucket().delete(row.object_key);
  }
  return Response.json({ ok: true }, { headers: privateHeaders });
}
