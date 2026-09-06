import { env } from 'cloudflare:workers';
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
  return origin !== null && origin === new URL(request.url).origin;
}
export const privateHeaders = { 'Cache-Control': 'no-store' };
