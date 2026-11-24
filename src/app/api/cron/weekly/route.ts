import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runWeekly } from '@/lib/monitor';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** Leaves room for one more store run (~2 min) inside the 300s limit. */
const START_NEW_RUN_BEFORE_MS = 150_000;

/**
 * Vercel Cron calls this every hour (see vercel.json) with `Authorization: Bearer $CRON_SECRET`.
 * Each call runs the stores that are due, oldest first, while there is time left.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const started = Date.now();
  const ran: string[] = [];
  while (Date.now() - started < START_NEW_RUN_BEFORE_MS) {
    const store = await db.store.findFirst({
      where: { nextRunAt: { lte: new Date() }, user: { plan: { in: ['monitor', 'agency'] } } },
      orderBy: { nextRunAt: 'asc' },
      include: { user: true },
    });
    if (!store) break;
    await runWeekly(store);
    ran.push(store.domain);
  }
  // Clean up expired rate-limit rows and sign-in tokens while we're here.
  await db.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await db.loginToken.deleteMany({ where: { expiresAt: { lt: new Date(Date.now() - 86_400_000) } } });
  return NextResponse.json({ ran });
}
