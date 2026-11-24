import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { toScanView } from '@/lib/scan-view';
import ScanReportClient from '@/components/ScanReportClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const scan = await db.scan.findUnique({ where: { id }, select: { storeName: true, domain: true, score: true, status: true } });
  if (!scan) return { title: 'Scan not found | AskRank' };
  if (scan.status !== 'done' || scan.score === null) return { title: `Scanning ${scan.domain} | AskRank`, robots: { index: false } };
  const title = `${scan.storeName}: AI Visibility ${scan.score}/100`;
  return {
    title: `${title} | AskRank`,
    description: `Do ChatGPT, Perplexity and Gemini recommend ${scan.storeName}? See the answers and who they recommend instead.`,
    robots: { index: false },
    openGraph: { title, images: [{ url: `/api/og/${id}`, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, images: [`/api/og/${id}`] },
  };
}

export default async function ScanPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ paid?: string; pending?: string }> }) {
  const { id } = await params;
  const { paid, pending } = await searchParams;
  const scan = await db.scan.findUnique({ where: { id } });
  if (!scan) notFound();
  const view = await toScanView(scan, await getUser());
  const notice = paid ? 'Payment received. Your Deep Audit is below, and we emailed you the link.' : pending && !view.deepAccess ? 'Your payment is being confirmed. Refresh this page in a minute.' : null;
  return <ScanReportClient initialScan={view} notice={notice} />;
}
