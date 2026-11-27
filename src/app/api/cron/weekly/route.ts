import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runWeekly } from '@/lib/monitor';
import { intEnv } from '@/lib/util';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** A store run takes up to ~2 minutes; no new batch starts after this, so everything ends inside 300s. */
const START_NEW_BATCH_BEFORE_MS = 150_000;

/**
 * Vercel Cron calls this (see vercel.json) with `Authorization: Bearer $CRON_SECRET`.
 * Each call runs the stores that are due, oldest first, CRON_PARALLEL at a time (default 4),
 * while there is time left. Once a day covers about 8 stores; on Vercel Pro you can run it hourly
 * (schedule "17 * * * *") for ~190 stores a day.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const started = Date.now();
  const parallel = intEnv('CRON_PARALLEL', 4);
  const ran: string[] = [];
  while (Date.now() - started < START_NEW_BATCH_BEFORE_MS) {
    const due = await db.store.findMany({
      where: { nextRunAt: { lte: new Date() }, user: { plan: { in: ['monitor', 'agency'] } } },
      orderBy: { nextRunAt: 'asc' },
      take: parallel,
      include: { user: true },
    });
    if (due.length === 0) break;
    await Promise.all(
      due.map((s) =>
        runWeekly(s)
          .then(() => ran.push(s.domain))
          .catch((e) => console.error('weekly run failed', s.domain, e)),
      ),
    );
  }
  const remaining = await db.store.count({ where: { nextRunAt: { lte: new Date() }, user: { plan: { in: ['monitor', 'agency'] } } } });
  if (remaining > 0) console.warn(`weekly cron: ${remaining} stores still due; they run next time. Consider an hourly schedule (Vercel Pro).`);

  // Clean up expired rate-limit rows and sign-in tokens while we're here.
  await db.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await db.loginToken.deleteMany({ where: { expiresAt: { lt: new Date(Date.now() - 86_400_000) } } });
  return NextResponse.json({ ran, remaining });
}
