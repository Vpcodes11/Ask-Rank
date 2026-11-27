import { NextRequest, NextResponse, after } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { createStoreScan, limitsFor, WEEK_MS } from '@/lib/monitor';
import { runScan } from '@/lib/scan-runner';
import { normalizeDomain } from '@/lib/util';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** Adds a store to weekly tracking and starts its first run right away. */
export async function POST(req: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const limits = limitsFor(user);
  if (limits.stores === 0) return NextResponse.json({ error: 'Tracking stores needs the Weekly Monitor or Agency plan.' }, { status: 402 });

  let body: { url?: string; niche?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }
  const domain = normalizeDomain(body.url || '');
  if (!domain) return NextResponse.json({ error: 'Enter the store address, like yourstore.com' }, { status: 400 });

  const count = await db.store.count({ where: { userId: user.id } });
  if (count >= limits.stores) return NextResponse.json({ error: `Your plan tracks up to ${limits.stores} store${limits.stores > 1 ? 's' : ''}. Remove one or upgrade.` }, { status: 403 });
  if (await db.store.findUnique({ where: { userId_domain: { userId: user.id, domain } } })) {
    return NextResponse.json({ error: 'You already track this store.' }, { status: 409 });
  }

  const store = await db.store.create({
    data: {
      userId: user.id,
      domain,
      name: domain,
      niche: typeof body.niche === 'string' ? body.niche.trim().slice(0, 80) || null : null,
      nextRunAt: new Date(Date.now() + WEEK_MS),
      lastRunAt: new Date(),
      manualRunAt: new Date(),
    },
  });
  const scan = await createStoreScan(store, user);
  after(async () => {
    await runScan(scan.id);
    const done = await db.scan.findUnique({ where: { id: scan.id }, select: { storeName: true, niche: true, status: true } });
    if (done?.status === 'done') await db.store.update({ where: { id: store.id }, data: { name: done.storeName, niche: store.niche ?? done.niche } });
  });
  return NextResponse.json({ store, scanId: scan.id });
}
