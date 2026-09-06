import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
export async function adminIdentity() {
  const user = await getChatGPTUser();
  const allowed = (env.ADMIN_EMAIL ?? '').trim().toLowerCase();
  return user && allowed && user.email.toLowerCase() === allowed ? user : null;
}
