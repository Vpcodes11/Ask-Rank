import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyWebhook, type DodoPayment, type DodoSubscription } from '@/lib/billing';
import { grantReport, syncSubscription } from '@/lib/billing-actions';

export const dynamic = 'force-dynamic';

type DodoEvent = { type: string; data: Record<string, unknown> };

/**
 * Dodo Payments webhook (Standard Webhooks signatures).
 * Subscribe to: payment.succeeded and all subscription.* events.
 */
export async function POST(req: Request) {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!secret) return NextResponse.json({ error: 'not configured' }, { status: 500 });
  const raw = await req.text();
  if (!verifyWebhook(raw, req.headers, secret)) return NextResponse.json({ error: 'bad signature' }, { status: 401 });

  const webhookId = req.headers.get('webhook-id') || '';
  if (webhookId && (await db.webhookEvent.findUnique({ where: { id: webhookId } }))) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  const event = JSON.parse(raw) as DodoEvent;
  let outcome = 'ignored';
  if (event.type === 'payment.succeeded') {
    outcome = await grantReport(event.data as unknown as DodoPayment);
  } else if (event.type?.startsWith('subscription.') && event.data?.subscription_id) {
    outcome = await syncSubscription(event.data as unknown as DodoSubscription);
  }

  if (webhookId) await db.webhookEvent.create({ data: { id: webhookId, type: event.type || 'unknown' } }).catch(() => {});
  return NextResponse.json({ received: true, outcome });
}
