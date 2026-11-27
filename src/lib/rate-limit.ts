import 'server-only';
import { db } from './db';

/**
 * Fixed-window counter stored in Postgres. Returns true when the action is allowed
 * (and counts it), false when `limit` was already reached inside the window.
 */
export async function hit(key: string, limit: number, windowSec: number): Promise<boolean> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSec * 1000);
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "expiresAt") VALUES (${key}, 1, ${expiresAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."expiresAt" < ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
      "expiresAt" = CASE WHEN "RateLimit"."expiresAt" < ${now} THEN ${expiresAt} ELSE "RateLimit"."expiresAt" END
    RETURNING "count"`;
  return Number(rows[0]?.count ?? 1) <= limit;
}

/** Undo one hit (e.g. the scan never started because the store could not be read). */
export async function refund(key: string) {
  await db.rateLimit.updateMany({ where: { key, count: { gt: 0 } }, data: { count: { decrement: 1 } } });
}
