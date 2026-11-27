import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Stops tracking a store (its weekly scans and drafts are deleted with it). */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const res = await db.store.deleteMany({ where: { id, userId: user.id } });
  if (res.count === 0) return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
