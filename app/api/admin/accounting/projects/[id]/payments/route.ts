import { adminIdentity } from '@/lib/admin';
import { cleanAccountingText, cleanAmount, validDate } from '@/lib/accounting';
import { database, privateHeaders, validOrigin } from '@/lib/inquiries';

export async function POST(
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
    if (raw.length > 5000)
      return Response.json({ error: 'Too large' }, { status: 413 });
    const body = JSON.parse(raw) as Record<string, unknown>;
    const amount = cleanAmount(body.amount);
    const paidAt = cleanAccountingText(body.paidAt, 10);
    const method = cleanAccountingText(body.method, 80);
    const note = cleanAccountingText(body.note, 500);
    if (amount === null || amount <= 0 || !paidAt || !validDate(paidAt))
      return Response.json({ error: 'Invalid input' }, { status: 400 });

    const { id: projectId } = await params;
    const db = database();
    const project = await db
      .prepare('SELECT id FROM accounting_projects WHERE id = ?')
      .bind(projectId)
      .first();
    if (!project) return Response.json({ error: 'Not found' }, { status: 404 });

    const id = crypto.randomUUID();
    const now = Date.now();
    await db.batch([
      db
        .prepare(
          `INSERT INTO project_payments
            (id, project_id, amount, paid_at, method, note, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(id, projectId, amount, paidAt, method, note, now),
      db
        .prepare('UPDATE accounting_projects SET updated_at = ? WHERE id = ?')
        .bind(now, projectId),
    ]);
    return Response.json({ id }, { status: 201, headers: privateHeaders });
  } catch (error) {
    console.error('Unable to create project payment', error);
    return Response.json(
      { error: 'Service unavailable' },
      { status: 503, headers: privateHeaders },
    );
  }
}
