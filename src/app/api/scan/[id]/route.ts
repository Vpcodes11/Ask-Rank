import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { toScanView } from '@/lib/scan-view';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scan = await db.scan.findUnique({ where: { id } });
  if (!scan) return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
  return NextResponse.json({ scan: await toScanView(scan, await getUser()) }, { headers: { 'Cache-Control': 'no-store' } });
}
