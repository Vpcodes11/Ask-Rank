import 'server-only';
import type { Scan, User } from '@prisma/client';
import { db } from './db';
import { FREE_VISIBLE_PROMPTS } from './plans';
import { STALE_AFTER_MS } from './scan-runner';
import type { BuyerPrompt, CitationSourceStats, CompetitorStats, EngineId, PromptRunResult, ScanBreakdown, ScanView } from './types';

/** Paid Deep Audit access: bought for this scan, or a subscriber looking at their own scan/store. */
export async function hasDeepAccess(scan: Scan, user: User | null): Promise<boolean> {
  if (scan.reportPaid) return true;
  if (!user || user.plan === 'free') return false;
  if (scan.userId === user.id) return true;
  if (scan.storeId) {
    const store = await db.store.findUnique({ where: { id: scan.storeId }, select: { userId: true } });
    return store?.userId === user.id;
  }
  return false;
}

/** What the browser may see. Locked prompts keep their question text but lose their answers. */
export async function toScanView(scan: Scan, user: User | null): Promise<ScanView> {
  const prompts = (scan.prompts as unknown as BuyerPrompt[]) || [];
  const deepAccess = await hasDeepAccess(scan, user);
  const unlocked = scan.unlocked || deepAccess;
  const visible = unlocked ? prompts : prompts.slice(0, FREE_VISIBLE_PROMPTS);
  const visibleIds = new Set(visible.map((p) => p.id));
  const results = ((scan.results as unknown as PromptRunResult[]) || []).filter((r) => visibleIds.has(r.prompt_id));

  const stale = scan.status === 'running' && Date.now() - scan.createdAt.getTime() > STALE_AFTER_MS;
  return {
    id: scan.id,
    slug: scan.slug,
    url: scan.url,
    domain: scan.domain,
    storeName: scan.storeName,
    niche: scan.niche,
    status: stale ? 'failed' : (scan.status as ScanView['status']),
    progress: stale ? null : scan.progress,
    error: stale ? 'The scan did not finish. Please run it again.' : scan.error,
    kind: scan.kind,
    score: scan.score,
    breakdown: (scan.breakdown as unknown as ScanBreakdown) ?? null,
    prompts,
    results,
    competitors: (scan.competitors as unknown as CompetitorStats[]) || [],
    sources: (scan.sources as unknown as CitationSourceStats[]) || [],
    engines: (scan.engines as unknown as EngineId[]) || [],
    unlocked,
    deepAccess,
    visiblePromptIds: [...visibleIds],
    createdAt: scan.createdAt.toISOString(),
    finishedAt: scan.finishedAt?.toISOString() ?? null,
  };
}
