import { adminIdentity } from '@/lib/admin';
import { database, validOrigin, privateHeaders } from '@/lib/inquiries';
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!validOrigin(request) || !(await adminIdentity(request)))
    return Response.json(
      { error: 'Forbidden' },
      { status: 403, headers: privateHeaders },
    );
  try {
    const raw = await request.text();
    if (raw.length > 6000)
      return Response.json({ error: 'Too large' }, { status: 413 });
    const body = JSON.parse(raw);
    if (
      !['new', 'reviewing', 'closed'].includes(body.status) ||
      typeof body.note !== 'string' ||
      body.note.length > 4000
    )
      return Response.json({ error: 'Invalid input' }, { status: 400 });
    const { id } = await params;
    const result = await database()
      .prepare('UPDATE inquiries SET status=?,note=?,updated_at=? WHERE id=?')
      .bind(body.status, body.note.trim(), Date.now(), id)
      .run();
    if (!result.meta.changes)
      return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ ok: true }, { headers: privateHeaders });
  } catch {
    return Response.json({ error: 'Unable to save' }, { status: 400 });
  }
}
