import { NextRequest, NextResponse, after } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { hit } from '@/lib/rate-limit';
import { createScanRecord, runScan } from '@/lib/scan-runner';
import { activeEngines } from '@/lib/engines';
import { FREE_SCAN_PROMPTS } from '@/lib/plans';
import { clientIp, intEnv, normalizeDomain, sha256 } from '@/lib/util';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** Starts a free scan. The scan runs after the response; the page polls GET /api/scan/:id. */
export async function POST(req: NextRequest) {
  let body: { url?: string; niche?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body */
  }
  const domain = normalizeDomain(body.url || '');
  if (!domain) return NextResponse.json({ error: 'Enter your store address, like yourstore.com' }, { status: 400 });
  if (activeEngines().length === 0) {
    return NextResponse.json({ error: 'Scanning is switched off right now. Please try again later.' }, { status: 503 });
  }

  // Same store scanned recently: reuse it (saves API cost, and stops refresh-spamming).
  const cacheHours = intEnv('FREE_SCAN_CACHE_HOURS', 24);
  const recent = await db.scan.findFirst({
    where: { domain, kind: 'free', status: { in: ['running', 'done'] }, createdAt: { gte: new Date(Date.now() - cacheHours * 3600_000) } },
    orderBy: { createdAt: 'desc' },
    select: { id: true },
  });
  if (recent) return NextResponse.json({ id: recent.id, cached: true });

  const user = await getUser();
  const ipHash = sha256(`${clientIp(req.headers)}|${process.env.AUTH_SECRET || ''}`);
  const perIp = user && user.plan !== 'free' ? intEnv('PAID_SCANS_PER_DAY', 30) : intEnv('FREE_SCANS_PER_IP_PER_DAY', 3);
  const day = new Date().toISOString().slice(0, 10);

  if (!(await hit(`scan:ip:${user && user.plan !== 'free' ? user.id : ipHash}:${day}`, perIp, 86_400))) {
    return NextResponse.json({ error: `You've used today's ${perIp} free scans. Come back tomorrow, or start a plan for weekly tracking.` }, { status: 429 });
  }
  if (!(await hit(`scan:global:${day}`, intEnv('FREE_SCANS_PER_DAY', 150), 86_400))) {
    return NextResponse.json({ error: 'We have hit today\'s scan limit. Please try again tomorrow.' }, { status: 429 });
  }

  const scan = await createScanRecord({
    domain,
    kind: 'free',
    promptCount: FREE_SCAN_PROMPTS,
    ipHash,
    userId: user?.id ?? null,
    niche: typeof body.niche === 'string' ? body.niche : null,
  });
  after(() => runScan(scan.id));
  return NextResponse.json({ id: scan.id });
}
