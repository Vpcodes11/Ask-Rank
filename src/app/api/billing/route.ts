import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SubscriptionRecord } from '@/lib/types';
import { PRICING_PLANS } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('store_id') || 'store-demo-blissclub';
  const subs = db.getSubscriptions(storeId);
  const currentSub = subs[0] || {
    id: 'sub-default',
    store_id: storeId,
    user_id: 'user-01',
    plan: 'free',
    status: 'active',
    interval: 'one_time',
    currency: 'INR',
    amount: 0,
    current_period_end: new Date(Date.now() + 365 * 86400000).toISOString(),
    created_at: new Date().toISOString()
  };

  return NextResponse.json({
    success: true,
    subscription: currentSub,
    plans: PRICING_PLANS
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { store_id, plan, currency = 'INR' } = body;

    const storeId = store_id || 'store-demo-blissclub';
    const planConfig = (PRICING_PLANS as any)[plan];

    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    const amount = currency === 'INR' ? planConfig.priceInr : planConfig.priceUsd;

    const newSub: SubscriptionRecord = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      store_id: storeId,
      user_id: 'user-01',
      plan,
      status: 'active',
      interval: planConfig.interval === 'monthly' ? 'monthly' : 'one_time',
      currency,
      amount,
      current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
      created_at: new Date().toISOString()
    };

    db.setSubscription(newSub);

    return NextResponse.json({
      success: true,
      message: `Upgraded to ${planConfig.name} plan successfully!`,
      subscription: newSub
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Billing update failed' }, { status: 500 });
  }
}
