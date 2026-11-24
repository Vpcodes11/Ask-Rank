import { NextRequest, NextResponse, after } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { createStoreScan, limitsFor } from '@/lib/monitor';
import { runScan } from '@/lib/scan-runner';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const MANUAL_EVERY_MS = 24 * 3600_000;

/** "Run now": one extra run per store per day, on top of the weekly schedule. */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  if (limitsFor(user).stores === 0) return NextResponse.json({ error: 'Your plan is not active.' }, { status: 402 });

  const store = await db.store.findFirst({ where: { id, userId: user.id } });
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  // Claim the daily slot atomically so double-clicks can't start two runs.
  const claimed = await db.store.updateMany({
    where: { id: store.id, OR: [{ manualRunAt: null }, { manualRunAt: { lt: new Date(Date.now() - MANUAL_EVERY_MS) } }] },
    data: { manualRunAt: new Date() },
  });
  if (claimed.count === 0) return NextResponse.json({ error: 'You can run each store once a day. The weekly run happens automatically.' }, { status: 429 });

  const scan = await createStoreScan(store, user);
  after(() => runScan(scan.id));
  return NextResponse.json({ scanId: scan.id });
}
