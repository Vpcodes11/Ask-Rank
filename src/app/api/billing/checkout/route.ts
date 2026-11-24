import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { billingEnabled, changePlan, createCheckout, productId, type ProductKey } from '@/lib/billing';
import { appUrl } from '@/lib/util';
import type { Currency } from '@/lib/plans';

export const dynamic = 'force-dynamic';

/** Form POST: product=report|monitor|agency, currency=USD|INR, scan_id (report only). Redirects to Dodo. */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const product = String(form.get('product') || '') as ProductKey;
  const currency: Currency = form.get('currency') === 'INR' ? 'INR' : 'USD';
  const base = appUrl();
  if (!['report', 'monitor', 'agency'].includes(product)) return NextResponse.redirect(`${base}/pricing`, 303);

  const pid = productId(product, currency);
  if (!billingEnabled() || !pid) return NextResponse.redirect(`${base}/pricing?error=billing`, 303);
  const user = await getUser();

  try {
    if (product === 'report') {
      const scanId = String(form.get('scan_id') || '');
      const scan = await db.scan.findUnique({ where: { id: scanId }, select: { id: true, status: true, email: true, reportPaid: true } });
      if (!scan || scan.status !== 'done') return NextResponse.redirect(`${base}/pricing?error=scan`, 303);
      if (scan.reportPaid) return NextResponse.redirect(`${base}/scan/${scan.id}#deep-audit`, 303);
      const url = await createCheckout({
        productId: pid,
        email: user?.email ?? scan.email,
        metadata: { kind: 'report', scan_id: scan.id },
        returnUrl: `${base}/api/billing/return?kind=report&scan=${scan.id}`,
      });
      return NextResponse.redirect(url, 303);
    }

    // Subscriptions need an account so the plan has somewhere to live.
    if (!user) return NextResponse.redirect(`${base}/login?next=${encodeURIComponent(`/pricing?plan=${product}&currency=${currency}`)}`, 303);
    if (user.billingSubscriptionId && user.plan !== 'free') {
      if (user.plan === product) return NextResponse.redirect(`${base}/dashboard`, 303);
      await changePlan(user.billingSubscriptionId, pid);
      return NextResponse.redirect(`${base}/dashboard?changed=1`, 303);
    }
    const url = await createCheckout({
      productId: pid,
      email: user.email,
      metadata: { kind: 'subscription', user_id: user.id, plan: product },
      returnUrl: `${base}/api/billing/return?kind=sub`,
    });
    return NextResponse.redirect(url, 303);
  } catch (e) {
    console.error('checkout failed', e);
    return NextResponse.redirect(`${base}/pricing?error=checkout`, 303);
  }
}
