'use client';

import { FormEvent, useEffect, useState } from 'react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.documentElement.lang = 'fa';
    document.documentElement.dir = 'rtl';
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        if (response.status === 429) {
          setError('تعداد تلاش‌ها زیاد بود. ۱۵ دقیقه دیگر دوباره امتحان کنید.');
        } else if (response.status === 401) {
          setError('رمز واردشده صحیح نیست.');
        } else if (response.status === 400 || response.status === 403) {
          setError(body?.error || 'درخواست ورود معتبر نیست.');
        } else {
          setError('سرویس ورود موقتاً در دسترس نیست. کمی بعد دوباره تلاش کنید.');
        }
        return;
      }
      window.location.replace('/admin');
    } catch {
      setError('ارتباط با سرور برقرار نشد. دوباره تلاش کنید.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-login">
      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <a href="/" className="admin-brand">
          <span aria-hidden="true">KI</span>
          <div>
            کیخسرو ایرانزاد<small>مدیریت استودیو</small>
          </div>
        </a>
        <div className="admin-login-heading">
          <span className="eyebrow">PRIVATE / STUDIO</span>
          <h1 id="admin-login-title">ورود به پنل مدیریت</h1>
          <p>برای مشاهده درخواست‌ها و مدیریت تصاویر، رمز ورود را وارد کنید.</p>
        </div>
        <form onSubmit={submit} className="admin-login-form">
          <label htmlFor="admin-password">رمز ورود</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={256}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
          />
          {error && <p role="alert">{error}</p>}
          <button type="submit" disabled={submitting || !password}>
            {submitting ? 'در حال بررسی…' : 'ورود به پنل'}
          </button>
        </form>
        <a href="/" className="admin-login-back">
          بازگشت به سایت ↗
        </a>
      </section>
    </main>
  );
}
