import { database, validOrigin, privateHeaders } from '@/lib/inquiries';
export async function POST(request: Request) {
  if (!validOrigin(request))
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  if (Number(request.headers.get('content-length')) > 12000)
    return Response.json({ error: 'Too large' }, { status: 413 });
  try {
    const raw = await request.text();
    if (raw.length > 12000)
      return Response.json({ error: 'Too large' }, { status: 413 });
    const body = JSON.parse(raw);
    const clean = (key: string) =>
      typeof body[key] === 'string' ? body[key].trim() : '';
    const name = clean('name'),
      email = clean('email').toLowerCase(),
      phone = clean('phone'),
      service = clean('service'),
      message = clean('message'),
      language = clean('language');
    if (
      clean('website') ||
      name.length < 2 ||
      name.length > 120 ||
      email.length > 254 ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      phone.length > 40 ||
      message.length < 10 ||
      message.length > 4000 ||
      !['editorial', 'portrait', 'other'].includes(service) ||
      !['fa', 'en'].includes(language)
    )
      return Response.json({ error: 'Invalid input' }, { status: 400 });
    const db = database(),
      now = Date.now(),
      id = crypto.randomUUID(),
      reference = `KI-${id.slice(0, 8).toUpperCase()}`;
    const recent = await db
      .prepare(
        'SELECT count(*) AS n FROM inquiries WHERE email=? AND created_at>?',
      )
      .bind(email, now - 3600000)
      .first<{ n: number }>();
    if ((recent?.n ?? 0) >= 3)
      return Response.json(
        { error: 'Please try later' },
        { status: 429, headers: { 'Retry-After': '3600' } },
      );
    await db
      .prepare(
        'INSERT INTO inquiries (id,reference,name,email,phone,service,message,language,status,note,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      )
      .bind(
        id,
        reference,
        name,
        email,
        phone,
        service,
        message,
        language,
        'new',
        '',
        now,
        now,
      )
      .run();
    return Response.json(
      { reference },
      { status: 201, headers: privateHeaders },
    );
  } catch (error) {
    if (error instanceof SyntaxError)
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    return Response.json(
      { error: 'Service unavailable' },
      { status: 503, headers: privateHeaders },
    );
  }
}
