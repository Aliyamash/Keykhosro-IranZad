'use client';
import { useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, Send } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
export function InquiryForm({ lang }: { lang: 'fa' | 'en' }) {
  const fa = lang === 'fa';
  const t = (a: string, b: string) => (fa ? a : b);
  const [service, setService] = useState('editorial');
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>(
    'idle',
  );
  const [ref, setRef] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === 'sending') return;
    const form = e.currentTarget;
    setState('sending');
    try {
      const data = Object.fromEntries(new FormData(form));
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, service, language: lang }),
      });
      if (!response.ok) throw Error('submit');
      const result = (await response.json()) as { reference: string };
      setRef(result.reference);
      setState('success');
      form.reset();
    } catch {
      setState('error');
    }
  }
  if (state === 'success')
    return (
      <div className="form-success" role="status">
        <span aria-hidden="true">
          <Check />
        </span>
        <h3>{t('درخواست شما ثبت شد.', 'Your request is received.')}</h3>
        <p>
          {t('کد پیگیری', 'REFERENCE')} <b dir="ltr">{ref}</b>
        </p>
        <button className="text-link" onClick={() => setState('idle')}>
          {t('درخواست جدید', 'NEW REQUEST')}{' '}
          <ArrowUpRight aria-hidden="true" />
        </button>
      </div>
    );
  return (
    <form className="inquiry-form" onSubmit={submit}>
      <div className="inquiry-heading">
        <span className="eyebrow">
          {t('درخواست همکاری', 'PROJECT INQUIRY')}
        </span>
        <span className="inquiry-heading-mark" aria-hidden="true">
          <Send />
        </span>
      </div>
      <label>
        {t('نام و نام خانوادگی', 'FULL NAME')} <span>*</span>
        <input
          name="name"
          autoComplete="name"
          required
          minLength={2}
          maxLength={120}
          placeholder={t('نام شما', 'Your name')}
        />
      </label>
      <label>
        {t('ایمیل', 'EMAIL ADDRESS')} <span>*</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          dir="ltr"
          placeholder="you@example.com"
        />
      </label>
      <label>
        {t('شماره تماس (اختیاری)', 'PHONE (OPTIONAL)')}
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          maxLength={40}
          dir="ltr"
          placeholder="+98"
        />
      </label>
      <div className="form-select">
        <span id="service-label">{t('نوع همکاری', 'PROJECT TYPE')}</span>
        <Select
          value={service}
          onValueChange={(v) => setService(v ?? 'editorial')}
        >
          <SelectTrigger
            aria-labelledby="service-label"
            className="service-trigger"
          >
            <SelectValue>
              {t(
                service === 'editorial'
                  ? 'عکاسی مد و ادیتوریال'
                  : service === 'portrait'
                    ? 'پرتره و مدلینگ'
                    : 'همکاری دیگر',
                service === 'editorial'
                  ? 'Fashion & editorial'
                  : service === 'portrait'
                    ? 'Portrait & modeling'
                    : 'Other collaboration',
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="studio-select">
            <SelectItem value="editorial">
              {t('عکاسی مد و ادیتوریال', 'Fashion & editorial')}
            </SelectItem>
            <SelectItem value="portrait">
              {t('پرتره و مدلینگ', 'Portrait & modeling')}
            </SelectItem>
            <SelectItem value="other">
              {t('همکاری دیگر', 'Other collaboration')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <label className="full-field">
        {t('کمی از پروژه‌تان بگویید', 'TELL US ABOUT YOUR PROJECT')}{' '}
        <span>*</span>
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={4000}
          rows={4}
          placeholder={t(
            'ایده، زمان‌بندی و جزئیات...',
            'Your idea, timeline and details...',
          )}
        />
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <p className="form-note">
        {t(
          'اطلاعات این فرم فقط برای بررسی درخواست و ارتباط درباره پروژه استفاده می‌شود.',
          'Your details are used only to review your inquiry and contact you about your project.',
        )}
      </p>
      {state === 'error' && (
        <p className="form-error" role="alert">
          {t(
            'ثبت درخواست انجام نشد. اطلاعات و اتصال را بررسی و دوباره تلاش کنید.',
            'Could not submit. Check your details and connection, then try again.',
          )}
        </p>
      )}
      <button
        type="submit"
        className="submit-button"
        disabled={state === 'sending'}
      >
        {state === 'sending'
          ? t('در حال ارسال…', 'SENDING…')
          : t('ارسال درخواست', 'SEND INQUIRY')}{' '}
        <Send aria-hidden="true" />
      </button>
    </form>
  );
}
