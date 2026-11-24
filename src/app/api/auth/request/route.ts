import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hit } from '@/lib/rate-limit';
import { sendEmail, layout, button } from '@/lib/email';
import { safeNext } from '@/lib/auth';
import { appUrl, clientIp, isEmail, randomToken, sha256 } from '@/lib/util';

export const dynamic = 'force-dynamic';

/** Emails a one-time sign-in link (valid 20 minutes). Creates the account on first sign-in. */
export async function POST(req: NextRequest) {
  let body: { email?: string; next?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }
  const email = String(body.email || '').trim().toLowerCase();
  if (!isEmail(email)) return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });

  const okEmail = await hit(`login:email:${sha256(email)}`, 5, 3600);
  const okIp = await hit(`login:ip:${sha256(clientIp(req.headers))}`, 20, 3600);
  if (!okEmail || !okIp) return NextResponse.json({ error: 'Too many sign-in emails. Please wait a bit and try again.' }, { status: 429 });

  const token = randomToken();
  await db.loginToken.create({ data: { email, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 20 * 60_000) } });
  const link = `${appUrl()}/auth/verify?token=${encodeURIComponent(token)}&next=${encodeURIComponent(safeNext(body.next))}`;

  try {
    await sendEmail({
      to: email,
      subject: 'Your AskRank sign-in link',
      text: `Sign in to AskRank: ${link}\n\nThis link works once and expires in 20 minutes. If you didn't ask for it, ignore this email.`,
      html: layout('Sign in to AskRank', `<p>Click below to sign in. The link works once and expires in 20 minutes.</p>${button(link, 'Sign in')}<p style="font-size:12px;color:#64748b">If you didn't ask for this, ignore this email.</p>`),
    });
  } catch (e) {
    console.error('login email failed', e);
    return NextResponse.json({ error: 'We could not send the email. Please try again.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
