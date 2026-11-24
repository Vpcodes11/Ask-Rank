import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSession, safeNext } from '@/lib/auth';
import { appUrl, sha256 } from '@/lib/util';

export const dynamic = 'force-dynamic';

/**
 * Consumes a sign-in token. It is a POST from the /auth/verify page (not the emailed GET link
 * itself) so that email link scanners that pre-open links can't use up the token.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const token = String(form.get('token') || '');
  const next = safeNext(form.get('next'));
  const base = appUrl();

  const row = token ? await db.loginToken.findUnique({ where: { tokenHash: sha256(token) } }) : null;
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    return NextResponse.redirect(`${base}/login?error=expired&next=${encodeURIComponent(next)}`, 303);
  }
  const claimed = await db.loginToken.updateMany({ where: { id: row.id, usedAt: null }, data: { usedAt: new Date() } });
  if (claimed.count !== 1) return NextResponse.redirect(`${base}/login?error=expired`, 303);

  const user = await db.user.upsert({ where: { email: row.email }, create: { email: row.email }, update: {} });
  // Attach Deep Audits bought before the account existed.
  await db.purchase.updateMany({ where: { email: row.email, userId: null }, data: { userId: user.id } });
  await createSession(user);
  return NextResponse.redirect(`${base}${next}`, 303);
}
