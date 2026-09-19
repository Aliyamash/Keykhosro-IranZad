export const projectStatuses = [
  'booked',
  'in_progress',
  'delivered',
  'settled',
  'cancelled',
] as const;

export type ProjectStatus = (typeof projectStatuses)[number];

export type AccountingProject = {
  id: string;
  reference: string;
  source_inquiry_id: string | null;
  client_name: string;
  client_phone: string;
  client_email: string;
  title: string;
  service: string;
  status: ProjectStatus;
  quoted_amount: number;
  paid_amount: number;
  internal_text: string;
  start_date: string;
  due_date: string;
  created_at: number;
  updated_at: number;
};

export type ProjectPayment = {
  id: string;
  project_id: string;
  amount: number;
  paid_at: string;
  method: string;
  note: string;
  created_at: number;
};

export function cleanAccountingText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export function cleanAmount(value: unknown) {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const amount =
    typeof value === 'number'
      ? value
      : Number(value.replaceAll(',', '').trim());
  return Number.isSafeInteger(amount) && amount >= 0 ? amount : null;
}

export function validDate(value: string) {
  return value === '' || /^\d{4}-\d{2}-\d{2}$/.test(value);
}
