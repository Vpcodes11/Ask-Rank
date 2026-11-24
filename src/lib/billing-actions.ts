import 'server-only';
import { db } from './db';
import { sendEmail, layout, button } from './email';
import { appUrl } from './util';
import { isReportProduct, keepsAccess, paymentSucceeded, userBillingState, type DodoPayment, type DodoSubscription } from './billing';

/** Marks a scan's Deep Audit as paid. Safe to call twice for the same payment. */
export async function grantReport(payment: DodoPayment, expectedScanId?: string): Promise<'granted' | 'already' | 'ignored'> {
  if (!paymentSucceeded(payment)) return 'ignored';
  const isReport = payment.metadata?.kind === 'report' || isReportProduct(payment.product_cart?.[0]?.product_id);
  const scanId = payment.metadata?.scan_id ? String(payment.metadata.scan_id) : null;
  if (!isReport || !scanId || (expectedScanId && scanId !== expectedScanId)) return 'ignored';

  const existing = await db.purchase.findUnique({ where: { paymentId: payment.payment_id } });
  if (existing) return 'already';

  const scan = await db.scan.findUnique({ where: { id: scanId } });
  if (!scan) return 'ignored';
  const email = payment.customer.email.toLowerCase();
  const user = await db.user.findUnique({ where: { email } });

  try {
    await db.$transaction([
      db.purchase.create({
        data: { paymentId: payment.payment_id, email, scanId, userId: user?.id ?? null, amount: payment.total_amount ?? null, currency: payment.currency ?? null },
      }),
      db.scan.update({ where: { id: scanId }, data: { reportPaid: true, unlocked: true, email: scan.email ?? email } }),
    ]);
  } catch (e) {
    // Unique violation: the webhook and the return redirect raced; the other one won.
    if ((e as { code?: string }).code === 'P2002') return 'already';
    throw e;
  }

  const link = `${appUrl()}/scan/${scanId}#deep-audit`;
  await sendEmail({
    to: email,
    subject: `Your AskRank Deep Audit for ${scan.storeName}`,
    text: `Thanks for your purchase. Your Deep Audit for ${scan.domain} is here: ${link}\nKeep this link; anyone with it can open the report.`,
    html: layout(`Deep Audit for ${scan.storeName}`, `<p>Thanks for your purchase. Your report for <b>${scan.domain}</b> is ready.</p>${button(link, 'Open the Deep Audit')}<p style="font-size:12px;color:#64748b">Keep this link: anyone with it can open the report.</p>`),
  }).catch((e) => console.error('report email failed', e));
  return 'granted';
}

/** Syncs a user's plan to the subscription's current state. */
export async function syncSubscription(sub: DodoSubscription): Promise<'updated' | 'ignored'> {
  const tagged = sub.metadata?.user_id ? String(sub.metadata.user_id) : null;
  const user = tagged
    ? await db.user.findUnique({ where: { id: tagged } })
    : await db.user.findFirst({ where: { billingSubscriptionId: sub.subscription_id } });
  if (!user) return 'ignored';
  // A late event about an old, ended subscription must not downgrade a newer one.
  if (user.billingSubscriptionId && user.billingSubscriptionId !== sub.subscription_id && !keepsAccess(sub.status)) return 'ignored';
  await db.user.update({ where: { id: user.id }, data: userBillingState(sub) });
  return 'updated';
}
