import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { hit } from '@/lib/rate-limit';
import { toScanView } from '@/lib/scan-view';
import { clientIp, isEmail, sha256 } from '@/lib/util';

export const dynamic = 'force-dynamic';

/** Free unlock of all prompts in exchange for an email (stored as a lead on the scan). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let email = '';
  try {
    email = String((await req.json()).email || '').trim().toLowerCase();
  } catch {
    /* empty */
  }
  if (!isEmail(email)) return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
  if (!(await hit(`unlock:${sha256(clientIp(req.headers))}`, 20, 3600))) {
    return NextResponse.json({ error: 'Too many attempts. Try again in an hour.' }, { status: 429 });
  }
  const scan = await db.scan.findUnique({ where: { id } });
  if (!scan) return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
  const updated = await db.scan.update({ where: { id }, data: { email: scan.email ?? email, unlocked: true } });
  return NextResponse.json({ scan: await toScanView(updated, await getUser()) });
}
