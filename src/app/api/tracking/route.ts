import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TrackingPoint } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('store_id') || 'store-demo-blissclub';
  const history = db.getTrackingHistory(storeId);
  const store = db.getStoreById(storeId);

  return NextResponse.json({
    success: true,
    storeId,
    storeName: store?.store_name || 'Active Store',
    schedule: 'Weekly (Every Monday 06:00 UTC)',
    nextRun: 'In 3 days',
    activePromptsCount: 50,
    history
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { store_id } = body;
    const storeId = store_id || 'store-demo-blissclub';
    const store = db.getStoreById(storeId);

    const history = db.getTrackingHistory(storeId);
    const lastPoint = history[history.length - 1] || {
      overallScore: 70,
      perplexityScore: 68,
      chatgptScore: 72,
      geminiScore: 74,
      googleAioScore: 70
    };

    // Simulate positive GEO momentum from recent content approvals
    const delta = Math.floor(Math.random() * 4) + 1; // +1 to +4
    const newPoint: TrackingPoint = {
      date: `Run ${history.length + 1} (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`,
      overallScore: Math.min(96, lastPoint.overallScore + delta),
      perplexityScore: Math.min(95, lastPoint.perplexityScore + delta + 1),
      chatgptScore: Math.min(94, lastPoint.chatgptScore + delta),
      geminiScore: Math.min(96, lastPoint.geminiScore + delta),
      googleAioScore: Math.min(95, lastPoint.googleAioScore + delta - 1)
    };

    db.addTrackingPoint(storeId, newPoint);

    const emailSummary = {
      to: 'founder@store.com',
      subject: `Weekly AskRank Report: ${store?.store_name || 'Store'} AI Visibility Score jumped to ${newPoint.overallScore}/100! 🚀`,
      highlights: [
        `Overall AI Visibility Score: ${newPoint.overallScore}/100 (+${delta} pts this week)`,
        `Mention Rate increased: Ranked in 38 out of 50 tracked buyer prompts (76%)`,
        `Perplexity Sonar citations grew by +3 new editorial references`,
        `ChatGPT Search now recommends your flagship product over key competitor in 2 high-intent queries`
      ]
    };

    return NextResponse.json({
      success: true,
      message: 'Weekly tracking prompt set executed successfully across all AI engines.',
      newPoint,
      emailSummary
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Tracking run failed' }, { status: 500 });
  }
}
