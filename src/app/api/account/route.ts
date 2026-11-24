import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Agency branding shown on PDF reports. */
export async function PATCH(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  if (user.plan !== 'agency') return NextResponse.json({ error: 'Report branding is part of the Agency plan.' }, { status: 402 });
  const body = await req.json().catch(() => ({}));
  const agencyName = String(body.agencyName || '').trim().slice(0, 60) || null;
  await db.user.update({ where: { id: user.id }, data: { agencyName } });
  return NextResponse.json({ ok: true, agencyName });
}
