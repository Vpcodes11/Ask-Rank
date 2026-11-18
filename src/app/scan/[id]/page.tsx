import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import ScanReportClient from '@/components/ScanReportClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const scan = db.getScanById(id);

  if (!scan) {
    return {
      title: 'Scan Not Found | AskRank',
      description: 'The requested AI Visibility scan could not be found.'
    };
  }

  return {
    title: `${scan.store_name} — AI Visibility Score: ${scan.score}/100 | AskRank`,
    description: `Does ChatGPT, Perplexity, or Gemini recommend ${scan.store_name}? See the AI shopping audit and competitor recommendations for ${scan.clean_domain}.`,
    openGraph: {
      title: `${scan.store_name} — AI Visibility Score: ${scan.score}/100`,
      description: `Tested across Perplexity, ChatGPT Search, Gemini, and Google AI Overviews. Mention rate: ${scan.breakdown.mention_rate}%.`,
      images: [
        {
          url: `/api/og/${scan.id}`,
          width: 1200,
          height: 630,
          alt: `${scan.store_name} AI Visibility Card`
        }
      ]
    }
  };
}

export default async function ScanReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scan = db.getScanById(id);

  if (!scan) {
    notFound();
  }

  return <ScanReportClient initialScan={scan} />;
}
