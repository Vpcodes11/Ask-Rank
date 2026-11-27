import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import { db } from './db';

const COOKIE = 'ar_session';

const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.NODE_ENV === 'production') throw new Error('AUTH_SECRET is not set');
  return new TextEncoder().encode(s || 'dev-secret-change-me');
};

export async function createSession(user: { id: string; sessionVersion: number }) {
  const token = await new SignJWT({ sub: user.id, sv: user.sessionVersion })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

async function readSession(): Promise<{ id: string; sv: number } | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.sub === 'string' ? { id: payload.sub, sv: Number(payload.sv ?? 0) } : null;
  } catch {
    return null;
  }
}

export async function getUser() {
  const s = await readSession();
  if (!s) return null;
  const user = await db.user.findUnique({ where: { id: s.id } });
  if (!user || user.sessionVersion !== s.sv) return null;
  return user;
}

/** For pages: the signed-in user, or a redirect to /login. */
export async function requireUser(next = '/dashboard') {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

/** Only allow same-site relative redirects after login. */
export function safeNext(next: unknown, fallback = '/dashboard'): string {
  const s = typeof next === 'string' ? next : '';
  return s.startsWith('/') && !s.startsWith('//') && !s.startsWith('/\\') ? s.slice(0, 500) : fallback;
}
