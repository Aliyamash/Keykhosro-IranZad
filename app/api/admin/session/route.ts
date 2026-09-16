import {
  adminClientKey,
  clearAdminSessionCookie,
  createAdminSessionCookie,
  verifyAdminPassword,
} from '@/lib/admin';
import { database, privateHeaders, validOrigin } from '@/lib/inquiries';

const MAX_FAILURES = 5;
const LOCK_DURATION = 15 * 60 * 1000;

export async function POST(request: Request) {
  if (!validOrigin(request))
    return Response.json(
      { error: 'درخواست نامعتبر است.' },
      { status: 403, headers: privateHeaders },
    );

  const key = await adminClientKey(request);
  const now = Date.now();
  const db = database();
  await db
    .prepare('DELETE FROM admin_login_attempts WHERE updated_at < ?')
    .bind(now - 7 * 24 * 60 * 60 * 1000)
    .run();
  const attempt = await db
    .prepare(
      'SELECT failures, locked_until FROM admin_login_attempts WHERE key=?',
    )
    .bind(key)
    .first<{ failures: number; locked_until: number }>();
  if (attempt && attempt.locked_until > now)
    return Response.json(
      { error: 'تلاش‌های ورود موقتاً محدود شده است.' },
      {
        status: 429,
        headers: {
          ...privateHeaders,
          'Retry-After': String(
            Math.ceil((attempt.locked_until - now) / 1000),
          ),
        },
      },
    );

  let password = '';
  try {
    const raw = await request.text();
    if (raw.length > 1000) throw new Error('Too large');
    const body = JSON.parse(raw) as { password?: unknown };
    if (typeof body.password === 'string') password = body.password;
  } catch {
    return Response.json(
      { error: 'اطلاعات ورود نامعتبر است.' },
      { status: 400, headers: privateHeaders },
    );
  }

  if (!(await verifyAdminPassword(password))) {
    const failures =
      attempt && attempt.locked_until === 0 ? attempt.failures + 1 : 1;
    const lockedUntil = failures >= MAX_FAILURES ? now + LOCK_DURATION : 0;
    await db
      .prepare(
        'INSERT INTO admin_login_attempts (key, failures, locked_until, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(key) DO UPDATE SET failures=excluded.failures, locked_until=excluded.locked_until, updated_at=excluded.updated_at',
      )
      .bind(key, failures >= MAX_FAILURES ? 0 : failures, lockedUntil, now)
      .run();
    return Response.json(
      { error: 'رمز واردشده صحیح نیست.' },
      { status: failures >= MAX_FAILURES ? 429 : 401, headers: privateHeaders },
    );
  }

  await db.prepare('DELETE FROM admin_login_attempts WHERE key=?').bind(key).run();
  return Response.json(
    { ok: true },
    {
      headers: {
        ...privateHeaders,
        'Set-Cookie': await createAdminSessionCookie(),
      },
    },
  );
}

export async function DELETE(request: Request) {
  if (!validOrigin(request))
    return Response.json(
      { error: 'Forbidden' },
      { status: 403, headers: privateHeaders },
    );
  return Response.json(
    { ok: true },
    {
      headers: {
        ...privateHeaders,
        'Set-Cookie': clearAdminSessionCookie(),
      },
    },
  );
}
