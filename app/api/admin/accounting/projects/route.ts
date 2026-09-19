import { adminIdentity } from '@/lib/admin';
import {
  cleanAccountingText,
  cleanAmount,
  projectStatuses,
  validDate,
} from '@/lib/accounting';
import { database, privateHeaders, validOrigin } from '@/lib/inquiries';

export async function GET(request: Request) {
  if (!(await adminIdentity(request)))
    return Response.json(
      { error: 'Unauthorized' },
      { status: 403, headers: privateHeaders },
    );

  const search = new URL(request.url).searchParams;
  const status = search.get('status') ?? 'all';
  const query = (search.get('q') ?? '').trim().slice(0, 120);
  if (status !== 'all' && !projectStatuses.includes(status as never))
    return Response.json({ error: 'Invalid filter' }, { status: 400 });

  const where: string[] = [];
  const bindings: string[] = [];
  if (status !== 'all') {
    where.push('p.status = ?');
    bindings.push(status);
  }
  if (query) {
    where.push(
      '(p.reference LIKE ? OR p.client_name LIKE ? OR p.client_phone LIKE ? OR p.client_email LIKE ? OR p.title LIKE ?)',
    );
    const term = `%${query}%`;
    bindings.push(term, term, term, term, term);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  try {
    const statement = database().prepare(
      `SELECT p.*,
        COALESCE((SELECT SUM(amount) FROM project_payments WHERE project_id = p.id), 0) AS paid_amount
       FROM accounting_projects p
       ${clause}
       ORDER BY p.created_at DESC
       LIMIT 500`,
    );
    const result = bindings.length
      ? await statement.bind(...bindings).all()
      : await statement.all();
    return Response.json(
      { items: result.results },
      { headers: privateHeaders },
    );
  } catch (error) {
    console.error('Unable to list accounting projects', error);
    return Response.json(
      { error: 'Service unavailable' },
      { status: 503, headers: privateHeaders },
    );
  }
}

export async function POST(request: Request) {
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
    const sourceInquiryId =
      cleanAccountingText(body.sourceInquiryId, 80) || null;
    const startDate = cleanAccountingText(body.startDate, 10);
    const dueDate = cleanAccountingText(body.dueDate, 10);
    const status = cleanAccountingText(body.status, 30) || 'booked';
    const quotedAmount = cleanAmount(body.quotedAmount);

    if (
      clientName.length < 2 ||
      title.length < 2 ||
      quotedAmount === null ||
      !projectStatuses.includes(status as never) ||
      !validDate(startDate) ||
      !validDate(dueDate) ||
      (clientEmail !== '' && !/^\S+@\S+\.\S+$/.test(clientEmail))
    )
      return Response.json({ error: 'Invalid input' }, { status: 400 });

    const db = database();
    if (sourceInquiryId) {
      const existing = await db
        .prepare(
          'SELECT id, reference FROM accounting_projects WHERE source_inquiry_id = ?',
        )
        .bind(sourceInquiryId)
        .first<{ id: string; reference: string }>();
      if (existing)
        return Response.json(
          { error: 'Already exists', ...existing },
          { status: 409, headers: privateHeaders },
        );
    }

    const id = crypto.randomUUID();
    const reference = `KI-P-${id.slice(0, 8).toUpperCase()}`;
    const now = Date.now();
    await db
      .prepare(
        `INSERT INTO accounting_projects
          (id, reference, source_inquiry_id, client_name, client_phone, client_email,
           title, service, status, quoted_amount, internal_text, start_date, due_date,
           created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        reference,
        sourceInquiryId,
        clientName,
        clientPhone,
        clientEmail,
        title,
        service,
        status,
        quotedAmount,
        internalText,
        startDate,
        dueDate,
        now,
        now,
      )
      .run();
    return Response.json(
      { id, reference },
      { status: 201, headers: privateHeaders },
    );
  } catch (error) {
    console.error('Unable to create accounting project', error);
    return Response.json(
      { error: 'Service unavailable' },
      { status: 503, headers: privateHeaders },
    );
  }
}
