'use client';
import { useEffect, useState } from 'react';
import type { Inquiry } from '@/lib/inquiries';
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
export default function AdminPanel({ email }: { email: string }) {
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
    <main className="admin-shell">
      <header className="admin-header">
        <a href="/">کیخسرو ایرانزاد / مدیریت</a>
        <span dir="ltr">{email}</span>
        <a href="/signout-with-chatgpt?return_to=/">خروج ↗</a>
      </header>
      <section className="admin-heading">
        <span className="eyebrow">STUDIO / INQUIRIES</span>
        <h1>درخواست‌های همکاری</h1>
        <p>{total} درخواست در این فهرست</p>
      </section>
      <div className="admin-toolbar">
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
          onClick={() => setRefresh((n) => n + 1)}
        >
          به‌روزرسانی ↻
        </button>
      </div>
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
          <a href="/studio#request">مشاهده فرم همکاری ↗</a>
        </div>
      ) : (
        <Table className="admin-table">
          <TableHeader>
            <TableRow>
              {['کد پیگیری', 'نام / ایمیل', 'تاریخ', 'وضعیت', 'جزئیات'].map(
                (h) => (
                  <TableHead key={h}>{h}</TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((i) => (
              <TableRow key={i.id}>
                <TableCell dir="ltr">{i.reference}</TableCell>
                <TableCell>
                  {i.name}
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
                  <button className="plain-button" onClick={() => open(i)}>
                    مشاهده ↗
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <div className="admin-pagination">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          صفحه قبل
        </button>
        <span>
          صفحه {page} از {Math.max(1, Math.ceil(total / 30))}
        </span>
        <button
          disabled={page * 30 >= total}
          onClick={() => setPage((p) => p + 1)}
        >
          صفحه بعد
        </button>
      </div>
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
              بستن ×
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
            <p>نوع همکاری: {active?.service}</p>
            <p className="inquiry-message">{active?.message}</p>
          </div>
          <label>وضعیت درخواست</label>
          {choices(status, setStatus)}
          <label htmlFor="admin-note">یادداشت داخلی</label>
          <textarea
            id="admin-note"
            maxLength={4000}
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {saveError && <p role="alert">{saveError}</p>}
          <button className="submit-button" disabled={saving} onClick={save}>
            {saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
          </button>
        </DialogContent>
      </Dialog>
    </main>
  );
}
