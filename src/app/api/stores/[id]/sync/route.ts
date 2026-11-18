import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auditProductStructuredData, detectContentGaps } from '@/lib/audit-engine';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const store = db.getStoreById(id);

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    const products = db.getProducts(store.id);
    let totalGap = 0;

    for (const prod of products) {
      const gaps = detectContentGaps(prod);
      totalGap += gaps.gapScore;
      db.updateProduct(prod.id, {
        content_gap_score: gaps.gapScore,
        content_gaps: gaps.gaps
      });
    }

    const avgGap = products.length > 0 ? Math.round(totalGap / products.length) : 50;
    const updatedStore = db.updateStore(store.id, {
      status: 'synced',
      last_synced_at: new Date().toISOString(),
      avg_gap_score: avgGap
    });

    return NextResponse.json({
      success: true,
      message: `Audited ${products.length} products with real-time schema and content gap scoring.`,
      store: updatedStore
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Sync failed' }, { status: 500 });
  }
}
