import 'server-only';
import type { Prisma } from '@prisma/client';
import { db } from './db';
import { fetchStoreSnapshot, StoreFetchError, COUNTRY_BY_CURRENCY } from './store-fetcher';
import { generateBuyerPrompts } from './prompt-generator';
import { activeEngines } from './engines';
import { citesStore, extractRankedBrands, mentionsBrand, productsMentioned, rankFromList } from './analyze';
import { calculateAIVisibilityScore } from './scoring';
import { mapLimit, shortId } from './util';
import type { BrandIdentity } from './analyze';
import type { PromptRunResult, StoreSnapshot } from './types';

/** Hard stop so a scan always finishes inside the 300s function limit. */
const TIME_BUDGET_MS = 250_000;
/** A scan still "running" after this long died with its function and is shown as failed. */
export const STALE_AFTER_MS = 6 * 60_000;

export async function createScanRecord(input: {
  domain: string;
  kind: 'free' | 'monitor';
  promptCount: number;
  ipHash?: string | null;
  userId?: string | null;
  storeId?: string | null;
  niche?: string | null;
  email?: string | null;
}) {
  return db.scan.create({
    data: {
      slug: `${input.domain.replace(/[^a-z0-9]+/g, '-')}-${shortId(6)}`,
      url: `https://${input.domain}`,
      domain: input.domain,
      storeName: input.domain,
      niche: input.niche?.trim().slice(0, 80) || '',
      kind: input.kind,
      promptCount: input.promptCount,
      ipHash: input.ipHash ?? null,
      userId: input.userId ?? null,
      storeId: input.storeId ?? null,
      email: input.email ?? null,
      unlocked: Boolean(input.email) || input.kind === 'monitor',
      progress: 'Reading your store…',
    },
  });
}

/** Runs a scan end to end and stores the result. Never throws: failures are saved on the scan. */
export async function runScan(scanId: string): Promise<void> {
  const started = Date.now();
  const scan = await db.scan.findUnique({ where: { id: scanId } });
  if (!scan || scan.status !== 'running') return;

  try {
    const engines = activeEngines();
    if (engines.length === 0) throw new StoreFetchError('Scanning is not available right now. (No AI engine API keys are configured.)');

    const snapshot: StoreSnapshot = await fetchStoreSnapshot(scan.domain);
    await progress(scanId, 'Writing buyer questions for your category…', {
      storeName: snapshot.storeName,
      currency: snapshot.currency,
      storeData: snapshot as unknown as Prisma.InputJsonValue,
    });

    const { niche, prompts } = await generateBuyerPrompts(snapshot, scan.promptCount, scan.niche || undefined);
    await progress(scanId, `Asking ${engines.map((e) => e.name).join(', ')}…`, {
      niche,
      prompts: prompts as unknown as Prisma.InputJsonValue,
      engines: engines.map((e) => e.id) as unknown as Prisma.InputJsonValue,
    });

    const brand: BrandIdentity = { name: snapshot.storeName, domain: snapshot.domain };
    const country = COUNTRY_BY_CURRENCY[snapshot.currency];
    let done = 0;

    const perPrompt = await mapLimit(prompts, 4, async (p) => {
      if (Date.now() - started > TIME_BUDGET_MS) {
        return engines.map((e) => failedRun(p.id, p.query, e.id, e.name, 'Skipped: scan ran out of time'));
      }
      const answers = await Promise.allSettled(engines.map((e) => e.ask(p.query, { country })));
      const texts = answers.map((a, i) => ({ engine: engines[i].id, text: a.status === 'fulfilled' ? a.value.text : '' }));
      const ranked = await extractRankedBrands(p.query, texts);

      const runs: PromptRunResult[] = answers.map((a, i) => {
        const e = engines[i];
        if (a.status === 'rejected') {
          console.error(`engine ${e.id} failed`, (a.reason as Error)?.message);
          return failedRun(p.id, p.query, e.id, e.name, 'This engine did not answer');
        }
        const { text, sources } = a.value;
        const mentioned = mentionsBrand(text, brand);
        const { position, competitors } = rankFromList(ranked[e.id] || [], brand);
        return {
          id: `${p.id}-${e.id}`,
          prompt_id: p.id,
          prompt: p.query,
          engine: e.id,
          engine_name: e.name,
          mentioned,
          cited: citesStore(sources, snapshot.domain),
          mentioned_products: productsMentioned(text, snapshot.products),
          position: mentioned ? position : null,
          competitors,
          sources,
          raw_response: text.slice(0, 8000),
          run_at: new Date().toISOString(),
        };
      });
      done++;
      await progress(scanId, `Asked ${done} of ${prompts.length} questions…`);
      return runs;
    });

    const results = perPrompt.flat();
    if (results.every((r) => r.error)) throw new Error('None of the AI engines answered. Please try again in a few minutes.');

    const { score, breakdown, competitors, sources } = calculateAIVisibilityScore(results);
    await db.scan.update({
      where: { id: scanId },
      data: {
        status: 'done',
        progress: null,
        score,
        breakdown: breakdown as unknown as Prisma.InputJsonValue,
        results: results as unknown as Prisma.InputJsonValue,
        competitors: competitors as unknown as Prisma.InputJsonValue,
        sources: sources as unknown as Prisma.InputJsonValue,
        finishedAt: new Date(),
      },
    });
  } catch (e) {
    const msg = e instanceof StoreFetchError ? e.message : (e as Error)?.message?.startsWith('None of the AI') ? (e as Error).message : 'Something went wrong while scanning. Please try again.';
    console.error('scan failed', scanId, e);
    await db.scan.update({ where: { id: scanId }, data: { status: 'failed', progress: null, error: msg, finishedAt: new Date() } }).catch(() => {});
  }
}

function failedRun(promptId: string, prompt: string, engine: PromptRunResult['engine'], name: string, error: string): PromptRunResult {
  return {
    id: `${promptId}-${engine}`,
    prompt_id: promptId,
    prompt,
    engine,
    engine_name: name,
    mentioned: false,
    cited: false,
    mentioned_products: [],
    position: null,
    competitors: [],
    sources: [],
    raw_response: '',
    error,
    run_at: new Date().toISOString(),
  };
}

async function progress(id: string, message: string, data: Prisma.ScanUpdateInput = {}) {
  await db.scan.update({ where: { id }, data: { ...data, progress: message } });
}
