import { env } from 'cloudflare:workers';

const publicOrigins = new Set([
  'https://keykhosro-iranzad.com',
  'https://www.keykhosro-iranzad.com',
]);

export type Inquiry = {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  language: string;
  status: 'new' | 'reviewing' | 'closed';
  note: string;
  created_at: number;
  updated_at: number;
};
export function database() {
  if (!env.DB) throw new Error('Database unavailable');
  return env.DB;
}
export function validOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    const normalizedOrigin = new URL(origin).origin;
    return (
      normalizedOrigin === new URL(request.url).origin ||
      publicOrigins.has(normalizedOrigin)
    );
  } catch {
    return false;
  }
}
export const privateHeaders = { 'Cache-Control': 'no-store' };
