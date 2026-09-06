import { adminIdentity } from '@/lib/admin';
import { database, privateHeaders } from '@/lib/inquiries';
export async function GET(request: Request) {
  if (!(await adminIdentity()))
    return Response.json(
      { error: 'Unauthorized' },
      { status: 403, headers: privateHeaders },
    );
  const search = new URL(request.url).searchParams;
  const status = search.get('status') ?? 'all';
  if (!['all', 'new', 'reviewing', 'closed'].includes(status))
    return Response.json({ error: 'Invalid filter' }, { status: 400 });
  const page = Math.max(1, Math.min(10000, Number(search.get('page')) || 1));
  const db = database();
  const result =
    status === 'all'
      ? await db
          .prepare(
            'SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 30 OFFSET ?',
          )
          .bind((page - 1) * 30)
          .all()
      : await db
          .prepare(
            'SELECT * FROM inquiries WHERE status=? ORDER BY created_at DESC LIMIT 30 OFFSET ?',
          )
          .bind(status, (page - 1) * 30)
          .all();
  const count =
    status === 'all'
      ? await db
          .prepare('SELECT count(*) AS n FROM inquiries')
          .first<{ n: number }>()
      : await db
          .prepare('SELECT count(*) AS n FROM inquiries WHERE status=?')
          .bind(status)
          .first<{ n: number }>();
  return Response.json(
    { items: result.results, total: count?.n ?? 0, page },
    { headers: privateHeaders },
  );
}
