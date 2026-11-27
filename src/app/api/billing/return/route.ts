import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { billingEnabled, getPayment, getSubscription, tagSubscription, userBillingState } from '@/lib/billing';
import { grantReport } from '@/lib/billing-actions';
import { appUrl } from '@/lib/util';

export const dynamic = 'force-dynamic';

/**
 * Dodo sends the buyer here after checkout (?payment_id=… or ?subscription_id=…, &status=…).
 * The query string can't be trusted, so the payment/subscription is re-read from Dodo.
 * The webhook does the same work; whichever arrives first wins and the other is a no-op.
 */
export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams;
  const base = appUrl();
  if (!billingEnabled()) return NextResponse.redirect(`${base}/pricing`, 303);

  if (q.get('kind') === 'report') {
    const scanId = q.get('scan') || '';
    const paymentId = q.get('payment_id');
    if (!paymentId) return NextResponse.redirect(`${base}/scan/${scanId}`, 303);
    try {
      const result = await grantReport(await getPayment(paymentId), scanId);
      const flag = result === 'ignored' ? 'pending=1' : 'paid=1';
      return NextResponse.redirect(`${base}/scan/${scanId}?${flag}#deep-audit`, 303);
    } catch (e) {
      console.error('report return failed', e);
      return NextResponse.redirect(`${base}/scan/${scanId}?pending=1`, 303);
    }
  }

  const user = await getUser();
  const subscriptionId = q.get('subscription_id');
  if (!user) return NextResponse.redirect(`${base}/login?next=/dashboard`, 303);
  if (!subscriptionId) return NextResponse.redirect(`${base}/dashboard`, 303);
  try {
    const sub = await getSubscription(subscriptionId);
    const tagged = sub.metadata?.user_id ? String(sub.metadata.user_id) : null;
    const ownsIt = tagged ? tagged === user.id : sub.customer.email.toLowerCase() === user.email;
    if (!ownsIt) return NextResponse.redirect(`${base}/dashboard?error=checkout`, 303);
    const state = userBillingState(sub);
    await db.user.update({ where: { id: user.id }, data: state });
    if (!tagged) await tagSubscription(sub.subscription_id, { user_id: user.id, plan: state.plan }).catch((e) => console.error('tag failed', e));
    return NextResponse.redirect(`${base}/dashboard?subscribed=1`, 303);
  } catch (e) {
    console.error('subscription return failed', e);
    return NextResponse.redirect(`${base}/dashboard?subscribed=1`, 303);
  }
}
