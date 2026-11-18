import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('store_id') || undefined;
  const opportunities = db.getCitationOpportunities(storeId);
  return NextResponse.json({ success: true, opportunities });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action_status } = body;

    if (!id || !action_status) {
      return NextResponse.json({ error: 'Missing id or action_status' }, { status: 400 });
    }

    const updated = db.updateCitationOpportunity(id, { action_status });
    if (!updated) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, opportunity: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}
