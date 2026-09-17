import { env } from 'cloudflare:workers';
import { headers } from 'next/headers';

const COOKIE_NAME = 'ki_admin_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;
// Cloudflare Workers currently caps Web Crypto PBKDF2 at 100,000 rounds.
const PASSWORD_ITERATIONS = 100_000;

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(value: string) {
  if (!/^[a-f0-9]+$/i.test(value) || value.length % 2 !== 0) return null;
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left[index] ^ right[index];
  }
  return difference === 0;
}

async function hmac(value: string) {
  const secret = String(env.ADMIN_SESSION_SECRET ?? '');
  if (secret.length < 32) return '';
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return bytesToHex(
    new Uint8Array(
      await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)),
    ),
  );
}

function cookieFromHeader(value: string | null) {
  if (!value) return null;
  for (const part of value.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === COOKIE_NAME) return rest.join('=') || null;
  }
  return null;
}

async function sessionCookie(request?: Request) {
  if (request) return cookieFromHeader(request.headers.get('cookie'));
  return cookieFromHeader((await headers()).get('cookie'));
}

export async function adminIdentity(request?: Request) {
  const token = await sessionCookie(request);
  if (!token) return false;
  const [expiresRaw, nonce, signature, ...extra] = token.split('.');
  if (extra.length || !expiresRaw || !nonce || !signature) return false;
  const expires = Number(expiresRaw);
  const now = Date.now();
  if (
    !Number.isSafeInteger(expires) ||
    expires <= now ||
    expires > now + (SESSION_TTL_SECONDS + 300) * 1000
  )
    return false;
  const expected = await hmac(`${expiresRaw}.${nonce}`);
  const providedBytes = hexToBytes(signature);
  const expectedBytes = hexToBytes(expected);
  return Boolean(
    providedBytes &&
      expectedBytes &&
      constantTimeEqual(providedBytes, expectedBytes),
  );
}

export async function verifyAdminPassword(password: string) {
  const record = String(env.ADMIN_PASSWORD_HASH ?? '');
  const [iterationsRaw, saltHex, expectedHex, ...extra] = record.split(':');
  const iterations = Number(iterationsRaw);
  const salt = hexToBytes(saltHex ?? '');
  const expected = hexToBytes(expectedHex ?? '');
  if (
    extra.length ||
    iterations !== PASSWORD_ITERATIONS ||
    !salt ||
    salt.length !== 16 ||
    !expected ||
    expected.length !== 32 ||
    !password ||
    password.length > 256
  )
    return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derived = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
      key,
      256,
    ),
  );
  return constantTimeEqual(derived, expected);
}

export async function createAdminSessionCookie() {
  const expires = Date.now() + SESSION_TTL_SECONDS * 1000;
  const nonce = crypto.randomUUID().replaceAll('-', '');
  const payload = `${expires}.${nonce}`;
  const signature = await hmac(payload);
  if (!signature) throw new Error('Admin session is not configured');
  return `${COOKIE_NAME}=${payload}.${signature}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}

export function clearAdminSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}

export async function adminClientKey(request: Request) {
  const forwardedAddress =
    request.headers.get('x-vercel-forwarded-for') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const edgeAddress =
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-real-ip');
  // Combining the client and edge addresses keeps rate limits stable behind
  // the Vercel -> Cloudflare proxy without trusting a forwarded value alone.
  const address =
    [forwardedAddress, edgeAddress].filter(Boolean).join('|') || 'unknown';
  const secret = String(env.ADMIN_SESSION_SECRET ?? '');
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${secret}:${address}`),
  );
  return bytesToHex(new Uint8Array(digest));
}
