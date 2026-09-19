'use client';

import {
  type SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {
  AccountingProject,
  ProjectPayment,
  ProjectStatus,
} from '@/lib/accounting';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Banknote,
  BriefcaseBusiness,
  CircleDollarSign,
  CreditCard,
  Download,
  Eye,
  FolderOpen,
  Plus,
  Save,
  WalletCards,
  X,
} from 'lucide-react';

const statusNames: Record<ProjectStatus | 'all', string> = {
  all: 'همه پروژه‌ها',
  booked: 'رزرو شده',
  in_progress: 'در حال اجرا',
  delivered: 'تحویل شده',
  settled: 'تسویه شده',
  cancelled: 'لغو شده',
};

type ProjectForm = {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  title: string;
  service: string;
  status: ProjectStatus;
  quotedAmount: string;
  internalText: string;
  startDate: string;
  dueDate: string;
};

const blankProject = (): ProjectForm => ({
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  title: '',
  service: '',
  status: 'booked',
  quotedAmount: '',
  internalText: '',
  startDate: '',
  dueDate: '',
});

const fromProject = (project: AccountingProject): ProjectForm => ({
  clientName: project.client_name,
  clientPhone: project.client_phone,
  clientEmail: project.client_email,
  title: project.title,
  service: project.service,
  status: project.status,
  quotedAmount: String(project.quoted_amount),
  internalText: project.internal_text,
  startDate: project.start_date,
  dueDate: project.due_date,
});

const money = new Intl.NumberFormat('fa-IR');

function escapeCsv(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export default function AccountingManager() {
  const [items, setItems] = useState<AccountingProject[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeReference, setActiveReference] = useState('پروژه جدید');
  const [form, setForm] = useState<ProjectForm>(blankProject);
  const [payments, setPayments] = useState<ProjectPayment[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentSaving, setPaymentSaving] = useState(false);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ status: statusFilter });
        if (query.trim()) params.set('q', query.trim());
        const response = await fetch(
          `/api/admin/accounting/projects?${params.toString()}`,
          { signal },
        );
        if (!response.ok) throw new Error('load');
        const data = (await response.json()) as { items: AccountingProject[] };
        setItems(data.items);
      } catch (loadError) {
        if ((loadError as Error).name !== 'AbortError')
          setError('دریافت دفتر پروژه‌ها انجام نشد.');
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [query, statusFilter],
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => load(controller.signal), 220);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [load, refresh]);

  useEffect(() => {
    const update = () => setRefresh((value) => value + 1);
    window.addEventListener('accounting:refresh', update);
    return () => window.removeEventListener('accounting:refresh', update);
  }, []);

  const financialItems = useMemo(
    () => items.filter((item) => item.status !== 'cancelled'),
    [items],
  );
  const totals = useMemo(() => {
    const quoted = financialItems.reduce(
      (sum, item) => sum + item.quoted_amount,
      0,
    );
    const paid = financialItems.reduce(
      (sum, item) => sum + item.paid_amount,
      0,
    );
    return { quoted, paid, remaining: Math.max(0, quoted - paid) };
  }, [financialItems]);

  function updateField<K extends keyof ProjectForm>(
    key: K,
    value: ProjectForm[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openNew() {
    setActiveId(null);
    setActiveReference('پروژه جدید');
    setForm(blankProject());
    setPayments([]);
    setFormError('');
    setDialogOpen(true);
  }

  async function openProject(project: AccountingProject) {
    setActiveId(project.id);
    setActiveReference(project.reference);
    setForm(fromProject(project));
    setPayments([]);
    setFormError('');
    setDialogOpen(true);
    setDetailLoading(true);
    try {
      const response = await fetch(
        `/api/admin/accounting/projects/${project.id}`,
      );
      if (!response.ok) throw new Error('detail');
      const data = (await response.json()) as {
        project: AccountingProject;
        payments: ProjectPayment[];
      };
      setForm(fromProject(data.project));
      setPayments(data.payments);
    } catch {
      setFormError('جزئیات پرداخت‌ها دریافت نشد.');
    } finally {
      setDetailLoading(false);
    }
  }

  async function saveProject(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setFormError('');
    try {
      const response = await fetch(
        activeId
          ? `/api/admin/accounting/projects/${activeId}`
          : '/api/admin/accounting/projects',
        {
          method: activeId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            quotedAmount: Number(form.quotedAmount.replaceAll(',', '')) || 0,
          }),
        },
      );
      if (!response.ok) throw new Error('save');
      setDialogOpen(false);
      setRefresh((value) => value + 1);
    } catch {
      setFormError('ذخیره پروژه انجام نشد. اطلاعات را بررسی کنید.');
    } finally {
      setSaving(false);
    }
  }

  async function addPayment(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeId || paymentSaving) return;
    setPaymentSaving(true);
    setFormError('');
    try {
      const response = await fetch(
        `/api/admin/accounting/projects/${activeId}/payments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Number(paymentAmount.replaceAll(',', '')),
            paidAt: paymentDate,
            method: paymentMethod,
            note: paymentNote,
          }),
        },
      );
      if (!response.ok) throw new Error('payment');
      setPaymentAmount('');
      setPaymentMethod('');
      setPaymentNote('');
      const detail = await fetch(`/api/admin/accounting/projects/${activeId}`);
      const data = (await detail.json()) as {
        project: AccountingProject;
        payments: ProjectPayment[];
      };
      setPayments(data.payments);
      setRefresh((value) => value + 1);
    } catch {
      setFormError('ثبت پرداخت انجام نشد. مبلغ و تاریخ را بررسی کنید.');
    } finally {
      setPaymentSaving(false);
    }
  }

  function exportCsv() {
    const headings = [
      'کد پروژه',
      'نام مشتری',
      'تلفن',
      'ایمیل',
      'عنوان پروژه',
      'نوع خدمت',
      'وضعیت',
      'مبلغ قرارداد (تومان)',
      'دریافتی (تومان)',
      'مانده (تومان)',
      'تاریخ شروع',
      'تاریخ تحویل',
      'متن داخلی',
    ];
    const rows = items.map((item) => [
      item.reference,
      item.client_name,
      item.client_phone,
      item.client_email,
      item.title,
      item.service,
      statusNames[item.status],
      item.quoted_amount,
      item.paid_amount,
      Math.max(0, item.quoted_amount - item.paid_amount),
      item.start_date,
      item.due_date,
      item.internal_text,
    ]);
    const csv = `\uFEFF${[headings, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\r\n')}`;
    const url = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `keykhosro-projects-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="accounting-manager" id="accounting">
      <div className="accounting-heading">
        <div>
          <span className="eyebrow">STUDIO / LEDGER</span>
          <h2>پروژه‌ها و حساب مشتری‌ها</h2>
          <p>قراردادها، دریافتی‌ها و یادداشت‌های داخلی در یک دفتر.</p>
        </div>
        <button className="accounting-primary" type="button" onClick={openNew}>
          <Plus aria-hidden="true" /> پروژه جدید
        </button>
      </div>

      <div className="accounting-summary" aria-label="خلاصه مالی فهرست">
        <article>
          <span className="summary-icon" aria-hidden="true">
            <BriefcaseBusiness />
          </span>
          <span>پروژه فعال</span>
          <strong>{financialItems.length.toLocaleString('fa-IR')}</strong>
        </article>
        <article>
          <span className="summary-icon" aria-hidden="true">
            <CircleDollarSign />
          </span>
          <span>ارزش قراردادها</span>
          <strong>{money.format(totals.quoted)}</strong>
          <small>تومان</small>
        </article>
        <article>
          <span className="summary-icon" aria-hidden="true">
            <WalletCards />
          </span>
          <span>دریافت‌شده</span>
          <strong>{money.format(totals.paid)}</strong>
          <small>تومان</small>
        </article>
        <article className="accounting-balance">
          <span className="summary-icon" aria-hidden="true">
            <Banknote />
          </span>
          <span>مانده دریافت</span>
          <strong>{money.format(totals.remaining)}</strong>
          <small>تومان</small>
        </article>
      </div>

      <div className="accounting-ledger">
        <div className="accounting-toolbar">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جست‌وجوی مشتری، پروژه یا کد…"
            aria-label="جست‌وجوی پروژه‌ها"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value ?? 'all')}
          >
            <SelectTrigger className="admin-select" aria-label="فیلتر پروژه‌ها">
              <SelectValue>
                {statusNames[statusFilter as keyof typeof statusNames]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="studio-select">
              {Object.entries(statusNames).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            className="plain-button"
            onClick={exportCsv}
            disabled={items.length === 0}
          >
            <Download aria-hidden="true" /> خروجی Excel / CSV
          </button>
        </div>

        {error ? (
          <div className="admin-empty" role="alert">
            {error}
          </div>
        ) : loading ? (
          <output className="admin-empty">در حال دریافت دفتر پروژه‌ها…</output>
        ) : items.length === 0 ? (
          <div className="admin-empty">
            <FolderOpen aria-hidden="true" />
            <h3>هنوز پروژه‌ای در این فهرست نیست.</h3>
            <p>
              پروژه جدید بسازید یا یک درخواست همکاری را به پروژه تبدیل کنید.
            </p>
          </div>
        ) : (
          <div className="accounting-table-wrap">
            <Table className="accounting-table">
              <TableHeader>
                <TableRow>
                  {[
                    'پروژه / مشتری',
                    'قرارداد',
                    'دریافتی',
                    'مانده',
                    'وضعیت',
                    '',
                  ].map((heading) => (
                    <TableHead key={heading}>{heading}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <strong>{item.title}</strong>
                      <small>
                        {item.client_name} ·{' '}
                        <span dir="ltr">{item.reference}</span>
                      </small>
                    </TableCell>
                    <TableCell>{money.format(item.quoted_amount)}</TableCell>
                    <TableCell>{money.format(item.paid_amount)}</TableCell>
                    <TableCell>
                      {money.format(
                        Math.max(0, item.quoted_amount - item.paid_amount),
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`project-status ${item.status}`}>
                        {statusNames[item.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        className="plain-button"
                        onClick={() => openProject(item)}
                      >
                        <Eye aria-hidden="true" /> پرونده
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => !saving && setDialogOpen(open)}
      >
        <DialogContent
          className="admin-dialog accounting-dialog"
          showCloseButton={false}
        >
          <div className="photo-dialog-top">
            <div>
              <DialogTitle>
                {activeId ? form.title : 'ثبت پروژه جدید'}
              </DialogTitle>
              <DialogDescription dir="ltr">{activeReference}</DialogDescription>
            </div>
            <DialogClose className="plain-button" disabled={saving}>
              بستن <X aria-hidden="true" />
            </DialogClose>
          </div>

          <form className="accounting-form" onSubmit={saveProject}>
            <div className="accounting-form-grid">
              <div className="accounting-field">
                <label htmlFor="project-client-name">نام مشتری *</label>
                <Input
                  id="project-client-name"
                  required
                  minLength={2}
                  value={form.clientName}
                  onChange={(event) =>
                    updateField('clientName', event.target.value)
                  }
                />
              </div>
              <div className="accounting-field">
                <label htmlFor="project-title">عنوان پروژه *</label>
                <Input
                  id="project-title"
                  required
                  minLength={2}
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                />
              </div>
              <div className="accounting-field">
                <label htmlFor="project-phone">شماره تماس</label>
                <Input
                  id="project-phone"
                  dir="ltr"
                  value={form.clientPhone}
                  onChange={(event) =>
                    updateField('clientPhone', event.target.value)
                  }
                />
              </div>
              <div className="accounting-field">
                <label htmlFor="project-email">ایمیل</label>
                <Input
                  id="project-email"
                  type="email"
                  dir="ltr"
                  value={form.clientEmail}
                  onChange={(event) =>
                    updateField('clientEmail', event.target.value)
                  }
                />
              </div>
              <div className="accounting-field">
                <label htmlFor="project-service">نوع خدمت</label>
                <Input
                  id="project-service"
                  value={form.service}
                  placeholder="پرتره، ادیتوریال، عروسی…"
                  onChange={(event) =>
                    updateField('service', event.target.value)
                  }
                />
              </div>
              <div className="accounting-field">
                <label htmlFor="project-amount">مبلغ قرارداد (تومان) *</label>
                <Input
                  id="project-amount"
                  required
                  min="0"
                  inputMode="numeric"
                  dir="ltr"
                  value={form.quotedAmount}
                  onChange={(event) =>
                    updateField(
                      'quotedAmount',
                      event.target.value.replace(/[^0-9,]/g, ''),
                    )
                  }
                />
              </div>
              <div className="accounting-field">
                <label htmlFor="project-start">تاریخ شروع</label>
                <Input
                  id="project-start"
                  type="date"
                  dir="ltr"
                  value={form.startDate}
                  onChange={(event) =>
                    updateField('startDate', event.target.value)
                  }
                />
              </div>
              <div className="accounting-field">
                <label htmlFor="project-due">تاریخ تحویل</label>
                <Input
                  id="project-due"
                  type="date"
                  dir="ltr"
                  value={form.dueDate}
                  onChange={(event) =>
                    updateField('dueDate', event.target.value)
                  }
                />
              </div>
            </div>
            <div className="accounting-field">
              <label htmlFor="project-status">وضعیت پروژه</label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  updateField('status', (value ?? 'booked') as ProjectStatus)
                }
              >
                <SelectTrigger id="project-status" className="admin-select">
                  <SelectValue>{statusNames[form.status]}</SelectValue>
                </SelectTrigger>
                <SelectContent className="studio-select">
                  {Object.entries(statusNames)
                    .filter(([value]) => value !== 'all')
                    .map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="accounting-field">
              <label htmlFor="project-internal-text">متن و یادداشت داخلی</label>
              <Textarea
                id="project-internal-text"
                rows={6}
                maxLength={8000}
                value={form.internalText}
                placeholder="توافق‌ها، جزئیات اجرا، خواسته‌های مشتری و هر نکته داخلی…"
                onChange={(event) =>
                  updateField('internalText', event.target.value)
                }
              />
            </div>
            <button className="submit-button" type="submit" disabled={saving}>
              <Save aria-hidden="true" />{' '}
              {saving ? 'در حال ذخیره…' : 'ذخیره پرونده پروژه'}
            </button>
          </form>

          {activeId && (
            <section className="payment-section">
              <div className="payment-heading">
                <h3>دریافتی‌ها</h3>
                <span>{payments.length.toLocaleString('fa-IR')} پرداخت</span>
              </div>
              {detailLoading ? (
                <p>در حال دریافت پرداخت‌ها…</p>
              ) : payments.length === 0 ? (
                <p className="payment-empty">هنوز پرداختی ثبت نشده است.</p>
              ) : (
                <div className="payment-list">
                  {payments.map((payment) => (
                    <article key={payment.id}>
                      <div>
                        <strong>{money.format(payment.amount)} تومان</strong>
                        <span>{payment.paid_at}</span>
                      </div>
                      <p>
                        {[payment.method, payment.note]
                          .filter(Boolean)
                          .join(' · ') || 'بدون توضیح'}
                      </p>
                    </article>
                  ))}
                </div>
              )}
              <form className="payment-form" onSubmit={addPayment}>
                <div className="accounting-field">
                  <label htmlFor="payment-amount">مبلغ دریافتی (تومان) *</label>
                  <Input
                    id="payment-amount"
                    required
                    inputMode="numeric"
                    dir="ltr"
                    value={paymentAmount}
                    onChange={(event) =>
                      setPaymentAmount(
                        event.target.value.replace(/[^0-9,]/g, ''),
                      )
                    }
                  />
                </div>
                <div className="accounting-field">
                  <label htmlFor="payment-date">تاریخ دریافت *</label>
                  <Input
                    id="payment-date"
                    required
                    type="date"
                    dir="ltr"
                    value={paymentDate}
                    onChange={(event) => setPaymentDate(event.target.value)}
                  />
                </div>
                <div className="accounting-field">
                  <label htmlFor="payment-method">روش پرداخت</label>
                  <Input
                    id="payment-method"
                    value={paymentMethod}
                    placeholder="کارت، نقد، انتقال…"
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  />
                </div>
                <div className="accounting-field payment-note">
                  <label htmlFor="payment-note">توضیح</label>
                  <Input
                    id="payment-note"
                    value={paymentNote}
                    placeholder="مرحله اول، بیعانه…"
                    onChange={(event) => setPaymentNote(event.target.value)}
                  />
                </div>
                <button
                  className="plain-button"
                  type="submit"
                  disabled={paymentSaving}
                >
                  <CreditCard aria-hidden="true" />{' '}
                  {paymentSaving ? 'در حال ثبت…' : 'ثبت پرداخت'}
                </button>
              </form>
            </section>
          )}
          {formError && (
            <p className="accounting-error" role="alert">
              {formError}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
