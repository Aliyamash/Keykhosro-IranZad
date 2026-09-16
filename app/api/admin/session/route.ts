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
    const lockedUntil = now + LOCK_DURATION;
    const updated = await db
      .prepare(
        `INSERT INTO admin_login_attempts (key, failures, locked_until, updated_at)
         VALUES (?, 1, 0, ?)
         ON CONFLICT(key) DO UPDATE SET
           failures = CASE
             WHEN admin_login_attempts.locked_until > ? THEN admin_login_attempts.failures
             WHEN admin_login_attempts.locked_until > 0 THEN 1
             WHEN admin_login_attempts.failures + 1 >= ? THEN 0
             ELSE admin_login_attempts.failures + 1
           END,
           locked_until = CASE
             WHEN admin_login_attempts.locked_until > ? THEN admin_login_attempts.locked_until
             WHEN admin_login_attempts.locked_until > 0 THEN 0
             WHEN admin_login_attempts.failures + 1 >= ? THEN ?
             ELSE 0
           END,
           updated_at = excluded.updated_at
         RETURNING failures, locked_until`,
      )
      .bind(key, now, now, MAX_FAILURES, now, MAX_FAILURES, lockedUntil)
      .first<{ failures: number; locked_until: number }>();
    const isLocked = Boolean(updated && updated.locked_until > now);
    return Response.json(
      {
        error: isLocked
          ? 'تلاش‌های ورود موقتاً محدود شده است.'
          : 'رمز واردشده صحیح نیست.',
      },
      {
        status: isLocked ? 429 : 401,
        headers: isLocked
          ? {
              ...privateHeaders,
              'Retry-After': String(
                Math.ceil(((updated?.locked_until ?? lockedUntil) - now) / 1000),
              ),
            }
          : privateHeaders,
      },
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
