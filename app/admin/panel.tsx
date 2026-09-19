'use client';
import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  FolderPlus,
  Images,
  Inbox,
  LogOut,
  RefreshCw,
  Save,
  WalletCards,
  X,
} from 'lucide-react';
import type { Inquiry } from '@/lib/inquiries';
import PhotoManager from './photo-manager';
import AccountingManager from './accounting-manager';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
const names: Record<string, string> = {
  all: 'همه درخواست‌ها',
  new: 'جدید',
  reviewing: 'در حال بررسی',
  closed: 'بسته‌شده',
};
const services: Record<string, string> = {
  editorial: 'عکاسی مد و ادیتوریال',
  portrait: 'پرتره و مدلینگ',
  other: 'همکاری دیگر',
};
export default function AdminPanel() {
  const [activeView, setActiveView] = useState<
    'inquiries' | 'accounting' | 'images'
  >('inquiries');
  const [items, setItems] = useState<Inquiry[]>([]),
    [total, setTotal] = useState(0),
    [filter, setFilter] = useState('all'),
    [page, setPage] = useState(1),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [refresh, setRefresh] = useState(0);
  const [active, setActive] = useState<Inquiry | null>(null),
    [status, setStatus] = useState('new'),
    [note, setNote] = useState(''),
    [saving, setSaving] = useState(false),
    [saveError, setSaveError] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertMessage, setConvertMessage] = useState('');
  useEffect(() => {
    document.documentElement.lang = 'fa';
    document.documentElement.dir = 'rtl';
  }, []);
  useEffect(() => {
    const c = new AbortController();
    setLoading(true);
    setError('');
    fetch('/api/admin/inquiries?status=' + filter + '&page=' + page, {
      signal: c.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw Error();
        return r.json() as Promise<{ items: Inquiry[]; total: number }>;
      })
      .then((d) => {
        setItems(d.items);
        setTotal(d.total);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError('دریافت درخواست‌ها انجام نشد.');
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [filter, page, refresh]);
  function open(i: Inquiry) {
    setActive(i);
    setStatus(i.status);
    setNote(i.note);
    setSaveError('');
    setConvertMessage('');
  }
  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch('/api/admin/session', { method: 'DELETE' });
    } finally {
      window.location.replace('/admin');
    }
  }
  async function save() {
    if (!active || saving) return;
    setSaving(true);
    setSaveError('');
    try {
      const r = await fetch('/api/admin/inquiries/' + active.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      });
      if (!r.ok) throw Error();
      setActive(null);
      setRefresh((n) => n + 1);
    } catch {
      setSaveError('ذخیره انجام نشد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  }
  async function convertToProject() {
    if (!active || converting) return;
    setConverting(true);
    setConvertMessage('');
    try {
      const response = await fetch('/api/admin/accounting/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceInquiryId: active.id,
          clientName: active.name,
          clientPhone: active.phone,
          clientEmail: active.email,
          title: services[active.service] || 'پروژه عکاسی',
          service: services[active.service] || active.service,
          status: 'booked',
          quotedAmount: 0,
          internalText: [
            `شرح اولیه مشتری:\n${active.message}`,
            note ? `یادداشت پیگیری:\n${note}` : '',
          ]
            .filter(Boolean)
            .join('\n\n'),
          startDate: '',
          dueDate: '',
        }),
      });
      const result = (await response.json()) as {
        reference?: string;
        error?: string;
      };
      if (!response.ok && response.status !== 409) throw new Error('convert');
      setConvertMessage(
        response.status === 409
          ? `این درخواست قبلاً با کد ${result.reference ?? ''} ثبت شده است.`
          : `پروژه ${result.reference ?? ''} ساخته شد؛ مبلغ و جزئیات مالی را در دفتر پروژه‌ها تکمیل کنید.`,
      );
      window.dispatchEvent(new Event('accounting:refresh'));
    } catch {
      setConvertMessage('تبدیل درخواست به پروژه انجام نشد.');
    } finally {
      setConverting(false);
    }
  }
  const choices = (value: string, change: (v: string) => void, all = false) => (
    <Select value={value} onValueChange={(v) => change(v ?? 'new')}>
      <SelectTrigger className="admin-select" aria-label="وضعیت درخواست">
        <SelectValue>{names[value]}</SelectValue>
      </SelectTrigger>
      <SelectContent className="studio-select">
        {Object.entries(names)
          .filter(([v]) => all || v !== 'all')
          .map(([v, l]) => (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
  return (
    <div className="admin-app">
      <aside className="admin-sidebar">
        <a href="/" className="admin-brand">
          <span aria-hidden="true">KI</span>
          <div>
            <strong>کیخسرو ایرانزاد</strong>
            <small>مدیریت استودیو</small>
          </div>
        </a>
        <nav className="admin-side-nav" aria-label="بخش‌های مدیریت">
          <span>فضای کاری</span>
          <button
            type="button"
            className={activeView === 'inquiries' ? 'is-active' : ''}
            aria-current={activeView === 'inquiries' ? 'page' : undefined}
            onClick={() => setActiveView('inquiries')}
          >
            <Inbox aria-hidden="true" />
            <span>درخواست‌ها</span>
            {total > 0 && <small>{total.toLocaleString('fa-IR')}</small>}
          </button>
          <button
            type="button"
            className={activeView === 'accounting' ? 'is-active' : ''}
            aria-current={activeView === 'accounting' ? 'page' : undefined}
            onClick={() => setActiveView('accounting')}
          >
            <WalletCards aria-hidden="true" />
            <span>پروژه‌ها و مالی</span>
          </button>
          <button
            type="button"
            className={activeView === 'images' ? 'is-active' : ''}
            aria-current={activeView === 'images' ? 'page' : undefined}
            onClick={() => setActiveView('images')}
          >
            <Images aria-hidden="true" />
            <span>مدیریت تصاویر</span>
          </button>
        </nav>
        <div className="admin-sidebar-footer">
          <span className="admin-secure-indicator">
            <i aria-hidden="true" /> نشست مدیریت فعال
          </span>
          <a href="/">
            <ExternalLink aria-hidden="true" /> مشاهده سایت
          </a>
          <button
            type="button"
            className="admin-signout"
            onClick={signOut}
            disabled={signingOut}
          >
            <LogOut aria-hidden="true" />
            {signingOut ? 'در حال خروج…' : 'خروج از پنل'}
          </button>
        </div>
      </aside>
      <main className="admin-workspace">
        <header className="admin-topbar">
          <div>
            <span>پنل مدیریت</span>
            <strong>
              {activeView === 'inquiries'
                ? 'درخواست‌های همکاری'
                : activeView === 'accounting'
                  ? 'پروژه‌ها و حسابداری'
                  : 'مدیریت تصاویر'}
            </strong>
          </div>
          <a href="/" className="admin-site-link">
            مشاهده سایت <ExternalLink aria-hidden="true" />
          </a>
        </header>
        <nav className="admin-mobile-nav" aria-label="بخش‌های مدیریت">
          <button
            type="button"
            className={activeView === 'inquiries' ? 'is-active' : ''}
            onClick={() => setActiveView('inquiries')}
          >
            <Inbox aria-hidden="true" /> درخواست‌ها
          </button>
          <button
            type="button"
            className={activeView === 'accounting' ? 'is-active' : ''}
            onClick={() => setActiveView('accounting')}
          >
            <WalletCards aria-hidden="true" /> مالی
          </button>
          <button
            type="button"
            className={activeView === 'images' ? 'is-active' : ''}
            onClick={() => setActiveView('images')}
          >
            <Images aria-hidden="true" /> تصاویر
          </button>
        </nav>
        <div className="admin-content">
          {activeView === 'inquiries' && (
            <div className="admin-view">
              <section className="admin-heading">
                <div>
                  <span className="eyebrow">INQUIRIES</span>
                  <h1>درخواست‌های همکاری</h1>
                  <p>پیگیری پیام‌های ورودی و تبدیل آن‌ها به پروژه.</p>
                </div>
                <div className="admin-count">
                  <span>کل درخواست‌ها</span>
                  <strong>
                    {loading ? '—' : total.toLocaleString('fa-IR')}
                  </strong>
                </div>
              </section>
              <section className="admin-inbox" aria-label="فهرست درخواست‌ها">
                <div className="admin-toolbar">
                  <span className="admin-inbox-title">صندوق درخواست‌ها</span>
                  {choices(
                    filter,
                    (v) => {
                      setFilter(v);
                      setPage(1);
                    },
                    true,
                  )}
                  <button
                    className="plain-button"
                    disabled={loading}
                    onClick={() => setRefresh((n) => n + 1)}
                  >
                    <RefreshCw aria-hidden="true" /> به‌روزرسانی
                  </button>
                </div>
                <div className="admin-table-scroll">
                  {error ? (
                    <div className="admin-empty" role="alert">
                      {error}
                    </div>
                  ) : loading ? (
                    <div className="admin-empty" role="status">
                      در حال دریافت درخواست‌ها…
                    </div>
                  ) : items.length === 0 ? (
                    <div className="admin-empty">
                      <h2>هنوز درخواستی در این فهرست نیست.</h2>
                      <p>درخواست‌های فرم همکاری اینجا نمایش داده می‌شوند.</p>
                      <a href="/studio#request">
                        مشاهده فرم همکاری <ArrowUpRight aria-hidden="true" />
                      </a>
                    </div>
                  ) : (
                    <Table className="admin-table">
                      <TableHeader>
                        <TableRow>
                          {[
                            'کد پیگیری',
                            'نام / ایمیل',
                            'تاریخ',
                            'وضعیت',
                            'جزئیات',
                          ].map((h) => (
                            <TableHead key={h}>{h}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map((i) => (
                          <TableRow key={i.id}>
                            <TableCell dir="ltr" className="admin-reference">
                              {i.reference}
                            </TableCell>
                            <TableCell>
                              <strong className="admin-client-name">
                                {i.name}
                              </strong>
                              <small dir="ltr">{i.email}</small>
                            </TableCell>
                            <TableCell>
                              {new Intl.DateTimeFormat('fa-IR', {
                                dateStyle: 'medium',
                              }).format(i.created_at)}
                            </TableCell>
                            <TableCell>
                              <span className={'status-badge ' + i.status}>
                                {names[i.status]}
                              </span>
                            </TableCell>
                            <TableCell>
                              <button
                                className="plain-button"
                                onClick={() => open(i)}
                              >
                                <Eye aria-hidden="true" /> مشاهده
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
                <div className="admin-pagination">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronRight aria-hidden="true" /> صفحه قبل
                  </button>
                  <span>
                    صفحه {page} از {Math.max(1, Math.ceil(total / 30))}
                  </span>
                  <button
                    disabled={page * 30 >= total}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    صفحه بعد <ChevronLeft aria-hidden="true" />
                  </button>
                </div>
              </section>
            </div>
          )}
          {activeView === 'accounting' && <AccountingManager />}
          {activeView === 'images' && <PhotoManager />}
        </div>
      </main>
      <Dialog
        open={!!active}
        onOpenChange={(o) => {
          if (!o && !saving) setActive(null);
        }}
      >
        <DialogContent className="admin-dialog" showCloseButton={false}>
          <div className="photo-dialog-top">
            <DialogTitle>{active?.name}</DialogTitle>
            <DialogClose className="plain-button" disabled={saving}>
              بستن <X aria-hidden="true" />
            </DialogClose>
          </div>
          <DialogDescription dir="ltr">{active?.reference}</DialogDescription>
          <div className="inquiry-details">
            <p>
              ایمیل: <span dir="ltr">{active?.email}</span>
            </p>
            <p>
              تلفن: <span dir="ltr">{active?.phone || '—'}</span>
            </p>
            <p>
              نوع همکاری:{' '}
              {active ? services[active.service] || active.service : ''}
            </p>
            <div className="inquiry-message">
              <span className="admin-field-caption">شرح پروژه</span>
              <p>{active?.message}</p>
            </div>
          </div>
          <span className="admin-field-caption">وضعیت درخواست</span>
          {choices(status, setStatus)}
          <label htmlFor="admin-note">یادداشت داخلی</label>
          <textarea
            id="admin-note"
            maxLength={4000}
            rows={4}
            value={note}
            placeholder="یادداشت پیگیری این درخواست…"
            onChange={(e) => setNote(e.target.value)}
          />
          {saveError && <p role="alert">{saveError}</p>}
          {convertMessage && (
            <output className="convert-feedback">{convertMessage}</output>
          )}
          <div className="inquiry-dialog-actions">
            <button className="submit-button" disabled={saving} onClick={save}>
              <Save aria-hidden="true" />{' '}
              {saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
            </button>
            <button
              className="plain-button"
              disabled={converting}
              onClick={convertToProject}
            >
              <FolderPlus aria-hidden="true" />{' '}
              {converting ? 'در حال ساخت پروژه…' : 'تبدیل به پروژه'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
