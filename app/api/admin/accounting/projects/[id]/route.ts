import { adminIdentity } from '@/lib/admin';
import {
  cleanAccountingText,
  cleanAmount,
  cleanCurrency,
  projectStatuses,
  validDate,
} from '@/lib/accounting';
import { database, privateHeaders, validOrigin } from '@/lib/inquiries';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  if (!(await adminIdentity(request)))
    return Response.json(
      { error: 'Unauthorized' },
      { status: 403, headers: privateHeaders },
    );
  const { id } = await params;
  try {
    const db = database();
    const project = await db
      .prepare(
        `SELECT p.*,
          COALESCE((SELECT SUM(amount) FROM project_payments WHERE project_id = p.id), 0) AS paid_amount
         FROM accounting_projects p WHERE p.id = ?`,
      )
      .bind(id)
      .first();
    if (!project) return Response.json({ error: 'Not found' }, { status: 404 });
    const payments = await db
      .prepare(
        'SELECT * FROM project_payments WHERE project_id = ? ORDER BY paid_at DESC, created_at DESC',
      )
      .bind(id)
      .all();
    return Response.json(
      { project, payments: payments.results },
      { headers: privateHeaders },
    );
  } catch (error) {
    console.error('Unable to load accounting project', error);
    return Response.json(
      { error: 'Service unavailable' },
      { status: 503, headers: privateHeaders },
    );
  }
}

export async function PATCH(request: Request, { params }: Context) {
  if (!validOrigin(request) || !(await adminIdentity(request)))
    return Response.json(
      { error: 'Forbidden' },
      { status: 403, headers: privateHeaders },
    );
  try {
    const raw = await request.text();
    if (raw.length > 18000)
      return Response.json({ error: 'Too large' }, { status: 413 });
    const body = JSON.parse(raw) as Record<string, unknown>;
    const clientName = cleanAccountingText(body.clientName, 120);
    const clientPhone = cleanAccountingText(body.clientPhone, 50);
    const clientEmail = cleanAccountingText(
      body.clientEmail,
      254,
    ).toLowerCase();
    const title = cleanAccountingText(body.title, 180);
    const service = cleanAccountingText(body.service, 120);
    const internalText = cleanAccountingText(body.internalText, 8000);
    const startDate = cleanAccountingText(body.startDate, 10);
    const dueDate = cleanAccountingText(body.dueDate, 10);
    const status = cleanAccountingText(body.status, 30);
    const currency = cleanCurrency(body.currency);
    const quotedAmount = cleanAmount(body.quotedAmount);
    if (
      clientName.length < 2 ||
      title.length < 2 ||
      quotedAmount === null ||
      currency === null ||
      !projectStatuses.includes(status as never) ||
      !validDate(startDate) ||
      !validDate(dueDate) ||
      (clientEmail !== '' && !/^\S+@\S+\.\S+$/.test(clientEmail))
    )
      return Response.json({ error: 'Invalid input' }, { status: 400 });

    const { id } = await params;
    const result = await database()
      .prepare(
        `UPDATE accounting_projects SET
          client_name = ?, client_phone = ?, client_email = ?, title = ?,
          service = ?, status = ?, currency = ?, quoted_amount = ?, internal_text = ?,
          start_date = ?, due_date = ?, updated_at = ?
         WHERE id = ?`,
      )
      .bind(
        clientName,
        clientPhone,
        clientEmail,
        title,
        service,
        status,
        currency,
        quotedAmount,
        internalText,
        startDate,
        dueDate,
        Date.now(),
        id,
      )
      .run();
    if (!result.meta.changes)
      return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ ok: true }, { headers: privateHeaders });
  } catch (error) {
    console.error('Unable to update accounting project', error);
    return Response.json(
      { error: 'Accounting storage unavailable' },
      { status: 503, headers: privateHeaders },
    );
  }
}
