import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { hasDeepAccess } from '@/lib/scan-view';
import { getOrBuildDeepAudit } from '@/lib/deep-audit';
import { generateLlmsTxt, productJsonLd } from '@/lib/audit-engine';
import type { StoreSnapshot } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/** Paid Deep Audit for a finished scan. Built on first request, then stored. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scan = await db.scan.findUnique({ where: { id } });
  if (!scan) return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
  if (!(await hasDeepAccess(scan, await getUser()))) return NextResponse.json({ error: 'The Deep Audit is a paid feature.' }, { status: 402 });
  const audit = await getOrBuildDeepAudit(scan);
  if (!audit) return NextResponse.json({ error: 'The scan has not finished yet.' }, { status: 409 });

  const snapshot = scan.storeData as unknown as StoreSnapshot;
  return NextResponse.json({
    audit,
    llmsTxt: generateLlmsTxt(snapshot),
    productSchemas: snapshot.products.slice(0, 5).map((p) => ({ title: p.title, url: p.url, jsonLd: productJsonLd(p, snapshot.storeName, snapshot.currency) })),
  });
}
