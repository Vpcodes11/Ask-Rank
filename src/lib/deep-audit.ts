import 'server-only';
import type { Prisma, Scan } from '@prisma/client';
import { db } from './db';
import { buildDeepAudit } from './audit-engine';
import type { DeepAudit, PromptRunResult, StoreSnapshot } from './types';

/** Returns the stored Deep Audit for a finished scan, building and saving it the first time. */
export async function getOrBuildDeepAudit(scan: Scan): Promise<DeepAudit | null> {
  if (scan.status !== 'done' || !scan.storeData) return null;
  if (scan.deepAudit) return scan.deepAudit as unknown as DeepAudit;
  const audit = await buildDeepAudit(scan.storeData as unknown as StoreSnapshot, (scan.results as unknown as PromptRunResult[]) || []);
  await db.scan.update({ where: { id: scan.id }, data: { deepAudit: audit as unknown as Prisma.InputJsonValue } });
  return audit;
}
