import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Marks a draft as applied (pasted into Shopify) or dismissed. AskRank never edits the store itself. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const status = String((await req.json().catch(() => ({}))).status || '');
  if (!['new', 'applied', 'dismissed'].includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  const res = await db.contentFix.updateMany({ where: { id, store: { userId: user.id } }, data: { status } });
  if (res.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
