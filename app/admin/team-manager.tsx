'use client';

import { useEffect, useState, type SyntheticEvent } from 'react';
import {
  ArrowUpRight,
  Check,
  ImagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import type { TeamMember } from '@/lib/team';

type Draft = Omit<TeamMember, 'id' | 'imageUrl' | 'isPrimary'>;

const emptyDraft: Draft = {
  nameFa: '',
  nameEn: '',
  roleFa: '',
  roleEn: '',
  bioFa: '',
  bioEn: '',
  instagram: '',
  linkedin: '',
  website: '',
  sortOrder: 100,
  active: true,
};

export default function TeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/team');
      if (!response.ok) throw new Error();
      setMembers(
        ((await response.json()) as { members: TeamMember[] }).members,
      );
    } catch {
      setError('دریافت اطلاعات اعضای صفحه درباره من انجام نشد.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function startNew() {
    setEditing(null);
    setDraft(emptyDraft);
    setFile(null);
    setPreview('');
    setError('');
    setMessage('');
    setFormOpen(true);
  }

  function startEdit(member: TeamMember) {
    const {
      id: _id,
      imageUrl: _imageUrl,
      isPrimary: _isPrimary,
      ...values
    } = member;
    setEditing(member);
    setDraft(values);
    setFile(null);
    setPreview('');
    setError('');
    setMessage('');
    setFormOpen(true);
  }

  function closeForm() {
    if (busy) return;
    setFormOpen(false);
    setEditing(null);
    setFile(null);
    setPreview('');
  }

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (!editing && !file) {
      setError('برای همکار جدید یک عکس انتخاب کنید.');
      return;
    }
    if (
      file &&
      (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size > 8 * 1024 * 1024)
    ) {
      setError('عکس باید JPG، PNG یا WebP و حداکثر ۸ مگابایت باشد.');
      return;
    }

    const data = new FormData();
    Object.entries(draft).forEach(([key, value]) =>
      data.set(key, String(value)),
    );
    if (file) data.set('image', file);
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(
        editing ? `/api/admin/team/${editing.id}` : '/api/admin/team',
        {
          method: editing ? 'PATCH' : 'POST',
          body: data,
        },
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(body.error || 'save');
      }
      setMessage(
        editing
          ? 'اطلاعات این فرد به‌روزرسانی شد.'
          : 'همکار جدید به صفحه درباره من اضافه شد.',
      );
      setFormOpen(false);
      setEditing(null);
      setFile(null);
      await load();
    } catch {
      setError('ذخیره انجام نشد. فیلدهای ضروری و اتصال را بررسی کنید.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(member: TeamMember) {
    if (member.isPrimary || busy) return;
    if (!window.confirm(`«${member.nameFa}» از صفحه درباره من حذف شود؟`))
      return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/team/${member.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error();
      setMessage('عضو انتخاب‌شده حذف شد.');
      await load();
    } catch {
      setError('حذف انجام نشد. دوباره تلاش کنید.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="team-manager">
      <header className="admin-heading team-heading">
        <div>
          <span className="eyebrow">ABOUT / PEOPLE</span>
          <h2>درباره من و همکاران</h2>
          <p>
            پروفایل دوزبانه، عکس و لینک‌های اجتماعی افراد حاضر در صفحه درباره من.
          </p>
        </div>
        <div className="team-heading-actions">
          <a
            className="plain-button"
            href="/about"
            target="_blank"
            rel="noreferrer"
          >
            مشاهده صفحه <ArrowUpRight aria-hidden="true" />
          </a>
          <button
            className="submit-button"
            type="button"
            onClick={startNew}
            disabled={busy}
          >
            <Plus aria-hidden="true" /> افزودن همکار
          </button>
        </div>
      </header>

      {(error || message) && (
        <div
          className={`media-feedback ${error ? 'error' : 'success'}`}
          role={error ? 'alert' : 'status'}
        >
          {error || message}
        </div>
      )}

      {formOpen && (
        <form className="team-form" onSubmit={submit}>
          <div className="team-form-head">
            <div>
              <span>
                {editing?.isPrimary
                  ? 'پروفایل اصلی'
                  : editing
                    ? 'ویرایش همکار'
                    : 'همکار جدید'}
              </span>
              <h3>{editing?.nameFa || 'افزودن فرد به صفحه درباره من'}</h3>
            </div>
            <button
              type="button"
              className="plain-button"
              onClick={closeForm}
              disabled={busy}
            >
              بستن <X aria-hidden="true" />
            </button>
          </div>
          <div className="team-form-grid">
            <label className="team-photo-field">
              <span>عکس پروفایل {editing ? '(اختیاری برای تغییر)' : '*'}</span>
              <span className="team-photo-preview">
                {preview || editing?.imageUrl ? (
                  <img
                    src={preview || editing?.imageUrl}
                    alt="پیش‌نمایش عکس پروفایل"
                  />
                ) : (
                  <ImagePlus aria-hidden="true" />
                )}
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const nextFile = event.target.files?.[0] ?? null;
                  setFile(nextFile);
                  setPreview(nextFile ? URL.createObjectURL(nextFile) : '');
                }}
                disabled={busy}
              />
              <small>JPG / PNG / WEBP — حداکثر ۸ مگابایت</small>
            </label>
            <div className="team-fields">
              <label>
                نام فارسی *
                <input
                  value={draft.nameFa}
                  onChange={(e) => update('nameFa', e.target.value)}
                  required
                  maxLength={120}
                />
              </label>
              <label>
                نام انگلیسی (اختیاری)
                <input
                  dir="ltr"
                  value={draft.nameEn}
                  onChange={(e) => update('nameEn', e.target.value)}
                  maxLength={120}
                  placeholder="بعداً تکمیل می‌شود"
                />
              </label>
              <label>
                عنوان / سمت فارسی
                <input
                  value={draft.roleFa}
                  onChange={(e) => update('roleFa', e.target.value)}
                  maxLength={160}
                />
              </label>
              <label>
                عنوان / سمت انگلیسی
                <input
                  dir="ltr"
                  value={draft.roleEn}
                  onChange={(e) => update('roleEn', e.target.value)}
                  maxLength={160}
                />
              </label>
            </div>
            <label className="team-bio">
              بیوگرافی فارسی *
              <textarea
                value={draft.bioFa}
                onChange={(e) => update('bioFa', e.target.value)}
                required
                rows={7}
                maxLength={5000}
              />
            </label>
            <label className="team-bio">
              بیوگرافی انگلیسی (اختیاری)
              <textarea
                dir="ltr"
                value={draft.bioEn}
                onChange={(e) => update('bioEn', e.target.value)}
                rows={7}
                maxLength={5000}
                placeholder="English biography can be added later"
              />
            </label>
            <div className="team-social-fields">
              <label>
                Instagram
                <input
                  dir="ltr"
                  type="url"
                  value={draft.instagram}
                  onChange={(e) => update('instagram', e.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </label>
              <label>
                LinkedIn
                <input
                  dir="ltr"
                  type="url"
                  value={draft.linkedin}
                  onChange={(e) => update('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                />
              </label>
              <label>
                Website
                <input
                  dir="ltr"
                  type="url"
                  value={draft.website}
                  onChange={(e) => update('website', e.target.value)}
                  placeholder="https://..."
                />
              </label>
            </div>
            <div className="team-options">
              {!editing?.isPrimary && (
                <label>
                  ترتیب نمایش
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={draft.sortOrder}
                    onChange={(e) =>
                      update('sortOrder', Number(e.target.value))
                    }
                  />
                </label>
              )}
              <label className="team-check">
                <input
                  type="checkbox"
                  checked={editing?.isPrimary ? true : draft.active}
                  disabled={editing?.isPrimary}
                  onChange={(e) => update('active', e.target.checked)}
                />
                نمایش در سایت
              </label>
            </div>
          </div>
          <button className="submit-button team-save" disabled={busy}>
            <Save aria-hidden="true" />{' '}
            {busy ? 'در حال ذخیره…' : 'ذخیره اطلاعات'}
          </button>
        </form>
      )}

      <div className="team-collection" aria-busy={loading}>
        <div className="admin-toolbar">
          <strong>افراد صفحه درباره من</strong>
          <button
            className="plain-button"
            type="button"
            onClick={() => void load()}
            disabled={loading || busy}
          >
            <RefreshCw aria-hidden="true" /> تازه‌سازی
          </button>
        </div>
        {loading ? (
          <p className="admin-empty">در حال دریافت اطلاعات…</p>
        ) : (
          <div className="team-cards">
            {members.map((member) => (
              <article
                className={`team-admin-card${member.active ? '' : ' is-muted'}`}
                key={member.id}
              >
                <div className="team-admin-photo">
                  {member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.nameFa} />
                  ) : (
                    <UserRound aria-hidden="true" />
                  )}
                </div>
                <div className="team-admin-copy">
                  <div className="team-admin-badges">
                    {member.isPrimary && (
                      <span>
                        <Check aria-hidden="true" /> پروفایل اصلی
                      </span>
                    )}
                    {!member.active && <span>عدم نمایش</span>}
                  </div>
                  <h3>{member.nameFa}</h3>
                  <small dir="ltr">{member.nameEn}</small>
                  <p>{member.roleFa || 'بدون عنوان'}</p>
                </div>
                <div className="team-card-actions">
                  <button
                    className="plain-button"
                    type="button"
                    onClick={() => startEdit(member)}
                    disabled={busy}
                  >
                    <Pencil aria-hidden="true" /> ویرایش
                  </button>
                  {!member.isPrimary && (
                    <button
                      className="plain-button danger"
                      type="button"
                      onClick={() => void remove(member)}
                      disabled={busy}
                    >
                      <Trash2 aria-hidden="true" /> حذف
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
