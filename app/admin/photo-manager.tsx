'use client';
import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowUpRight,
  Check,
  ImagePlus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { Photo } from '@/lib/photo-types';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
export default function PhotoManager() {
  const [items, setItems] = useState<Photo[]>([]);
  const [section, setSection] = useState('works');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState<Photo | null>(null);
  async function load() {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/photos');
      if (!r.ok) throw Error();
      setItems(((await r.json()) as { items: Photo[] }).items);
    } catch {
      setError('دریافت تصاویر انجام نشد. دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  async function upload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy || !file) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > 8 * 1024 * 1024
    ) {
      setError('عکس JPG، PNG یا WebP با حجم حداکثر ۸ مگابایت انتخاب کنید.');
      return;
    }
    const form = e.currentTarget;
    const data = new FormData(form);
    data.set('file', file);
    data.set('section', section);
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const r = await fetch('/api/admin/photos', {
        method: 'POST',
        body: data,
      });
      if (!r.ok) throw Error();
      form.reset();
      setFile(null);
      setMessage('عکس اضافه شد و در بخش انتخاب‌شده نمایش داده می‌شود.');
      await load();
    } catch {
      setError('آپلود انجام نشد؛ نوع و حجم عکس و اتصال را بررسی کنید.');
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!pending || busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const r = await fetch(`/api/admin/photos/${pending.id}`, {
        method: 'DELETE',
      });
      if (!r.ok) throw Error();
      setItems((old) => old.filter((p) => p.id !== pending.id));
      setPending(null);
      setMessage('عکس از بخش انتخاب‌شده حذف شد.');
    } catch {
      setError('حذف انجام نشد. دوباره تلاش کنید.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section id="photo-library" className="photo-manager">
      <header className="admin-heading">
        <div>
          <span className="eyebrow">STUDIO / IMAGE LIBRARY</span>
          <h2>آثار و گالری</h2>
          <p>
            تصاویر صفحه اصلی ثابت می‌مانند. گالری در صفحات آثار و استودیو نمایش
            داده می‌شود.
          </p>
        </div>
        <a className="plain-button" href="/works">
          مشاهده آثار <ArrowUpRight aria-hidden="true" />
        </a>
      </header>
      <div className="media-layout">
        <form className="media-upload" onSubmit={upload}>
          <h3>افزودن عکس</h3>
          <label htmlFor="photo-destination">محل نمایش</label>
          <Select
            value={section}
            onValueChange={(v) => setSection(v ?? 'works')}
            disabled={busy}
          >
            <SelectTrigger id="photo-destination" className="admin-select">
              <SelectValue>
                {section === 'works' ? 'آثار' : 'گالری'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="studio-select">
              <SelectItem value="works">آثار</SelectItem>
              <SelectItem value="gallery">گالری</SelectItem>
            </SelectContent>
          </Select>
          <label className="media-file">
            {preview ? (
              <img src={preview} alt="پیش‌نمایش عکس انتخاب‌شده" />
            ) : (
              <span aria-hidden="true">
                <ImagePlus />
              </span>
            )}
            <span>انتخاب عکس</span>
            <input
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/webp"
              required
              disabled={busy}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <small>JPG / PNG / WEBP — حداکثر ۸ مگابایت</small>
          <label htmlFor="photo-fa">عنوان فارسی</label>
          <input
            id="photo-fa"
            name="title_fa"
            required
            maxLength={120}
            placeholder="مثلاً: پرتره در نور"
            disabled={busy}
          />
          <label htmlFor="photo-en">عنوان انگلیسی</label>
          <input
            id="photo-en"
            name="title_en"
            dir="ltr"
            required
            maxLength={120}
            placeholder="Portrait in light"
            disabled={busy}
          />
          <button className="submit-button" disabled={busy || !file}>
            <Upload aria-hidden="true" />{' '}
            {busy
              ? 'در حال انجام…'
              : 'افزودن به ' + (section === 'works' ? 'آثار' : 'گالری')}
          </button>
        </form>
        <div className="media-collection" aria-busy={loading}>
          <div className="admin-toolbar">
            <strong>
              {section === 'works' ? 'تصاویر آثار' : 'تصاویر گالری'}
            </strong>
            <button
              className="plain-button"
              disabled={busy || loading}
              onClick={() => {
                setError('');
                void load();
              }}
            >
              <RefreshCw aria-hidden="true" /> تازه‌سازی
            </button>
          </div>
          {loading ? (
            <p className="admin-empty" role="status">
              در حال دریافت تصاویر…
            </p>
          ) : (
            <div className="media-grid">
              {items
                .filter((p) => p.section === section)
                .map((p) => (
                  <article className="media-card" key={p.id}>
                    <img src={p.url} alt={p.title_fa} loading="lazy" />
                    <div>
                      <h3>{p.title_fa}</h3>
                      <small dir="ltr">{p.title_en}</small>
                      <button
                        className="plain-button"
                        disabled={busy}
                        onClick={() => {
                          setError('');
                          setPending(p);
                        }}
                      >
                        <Trash2 aria-hidden="true" /> حذف عکس
                      </button>
                    </div>
                  </article>
                ))}
              {!items.some((p) => p.section === section) && (
                <p className="admin-empty">هنوز عکسی در این بخش نیست.</p>
              )}
            </div>
          )}
        </div>
      </div>
      {error && (
        <p className="media-feedback" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="media-feedback" role="status">
          {message}
        </p>
      )}
      <AlertDialog
        open={!!pending}
        onOpenChange={(o) => {
          if (!o && !busy) setPending(null);
        }}
      >
        <AlertDialogContent className="admin-dialog">
          <AlertDialogTitle>این عکس حذف شود؟</AlertDialogTitle>
          <AlertDialogDescription>
            «{pending?.title_fa}» از{' '}
            {pending?.section === 'works' ? 'آثار' : 'گالری'} حذف می‌شود. برای
            برگرداندن عکس آپلودشده، باید دوباره آن را اضافه کنید. صفحه اصلی
            تغییری نمی‌کند.
          </AlertDialogDescription>
          {error && <p role="alert">{error}</p>}
          <button
            className="plain-button"
            onClick={() => setPending(null)}
            disabled={busy}
          >
            <X aria-hidden="true" /> انصراف
          </button>
          <button className="submit-button" onClick={remove} disabled={busy}>
            <Check aria-hidden="true" />{' '}
            {busy ? 'در حال حذف…' : 'تأیید حذف'}
          </button>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
