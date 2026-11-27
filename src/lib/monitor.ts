import 'server-only';
import type { Store, User } from '@prisma/client';
import { db } from './db';
import { createScanRecord, runScan } from './scan-runner';
import { PLAN_LIMITS, type PlanId } from './plans';
import { sendEmail, layout, button, esc } from './email';
import { appUrl } from './util';
import type { CompetitorStats } from './types';

export const WEEK_MS = 7 * 86_400_000;

export const limitsFor = (user: Pick<User, 'plan'>) => PLAN_LIMITS[(user.plan as PlanId) in PLAN_LIMITS ? (user.plan as PlanId) : 'free'];

/** Creates the monitor scan row for a store (the caller decides whether to await runScan). */
export async function createStoreScan(store: Store, user: User) {
  return createScanRecord({
    domain: store.domain,
    kind: 'monitor',
    promptCount: limitsFor(user).promptsPerRun,
    userId: user.id,
    storeId: store.id,
    niche: store.niche,
  });
}

/** Runs one weekly scan for a store, schedules the next one and emails the owner. */
export async function runWeekly(store: Store & { user: User }) {
  // Reserve the slot first so an overlapping cron run doesn't pick the same store.
  await db.store.update({ where: { id: store.id }, data: { nextRunAt: new Date(Date.now() + WEEK_MS), lastRunAt: new Date() } });
  const scan = await createStoreScan(store, store.user);
  await runScan(scan.id);
  const done = await db.scan.findUnique({ where: { id: scan.id }, select: { status: true, storeName: true } });
  if (done?.status === 'done' && done.storeName !== store.name) await db.store.update({ where: { id: store.id }, data: { name: done.storeName } });
  await sendDigest(store, store.user, scan.id).catch((e) => console.error('digest email failed', e));
}

async function sendDigest(store: Store, user: User, scanId: string) {
  const [latest, previous] = await db.scan.findMany({
    where: { storeId: store.id, status: 'done' },
    orderBy: { createdAt: 'desc' },
    take: 2,
  });
  if (!latest || latest.id !== scanId || latest.score === null) return;
  const delta = previous?.score != null ? latest.score - previous.score : null;
  const comps = ((latest.competitors as unknown as CompetitorStats[]) || []).slice(0, 3);
  const link = `${appUrl()}/scan/${latest.id}`;
  const change = delta === null ? 'first weekly run' : delta === 0 ? 'no change from last week' : `${delta > 0 ? '+' : ''}${delta} vs last week`;
  const compLine = comps.length ? `Most recommended instead of you: ${comps.map((c) => `${c.name} (${c.percentage}%)`).join(', ')}` : '';
  await sendEmail({
    to: user.email,
    subject: `${store.name}: AI Visibility ${latest.score}/100 (${change})`,
    text: `AI Visibility Score for ${store.domain}: ${latest.score}/100 (${change}).\n${compLine}\nFull report: ${link}`,
    html: layout(
      `${store.name}: ${latest.score}/100`,
      `<p>AI Visibility Score for <b>${esc(store.domain)}</b>: <b>${latest.score}/100</b> (${esc(change)}).</p>${compLine ? `<p>${esc(compLine)}</p>` : ''}${button(link, 'Open this week\'s report')}`,
    ),
  });
}
