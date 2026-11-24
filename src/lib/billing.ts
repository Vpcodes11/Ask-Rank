import 'server-only';
import type { Currency, PlanId } from './plans';
export { verifyWebhook } from './webhook-signature';

/**
 * Dodo Payments (merchant of record: charges the customer, handles GST/VAT/sales tax,
 * pays out to you, supports INR and USD). REST API via fetch. Docs: https://docs.dodopayments.com
 *
 * Products are created in the Dodo dashboard; their IDs go in env vars:
 *   DODO_PRODUCT_REPORT_USD / _INR    one-time Deep Audit
 *   DODO_PRODUCT_MONITOR_USD / _INR   monthly subscription
 *   DODO_PRODUCT_AGENCY_USD / _INR    monthly subscription
 * The _INR ones are optional; without them Indian buyers get the USD product.
 */

export type ProductKey = 'report' | 'monitor' | 'agency';

const apiBase = () =>
  process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'https://live.dodopayments.com' : 'https://test.dodopayments.com';

export const billingEnabled = () => Boolean(process.env.DODO_PAYMENTS_API_KEY);

export function productId(key: ProductKey, currency: Currency): string | undefined {
  const k = key.toUpperCase();
  return (currency === 'INR' ? process.env[`DODO_PRODUCT_${k}_INR`] : undefined) || process.env[`DODO_PRODUCT_${k}_USD`] || undefined;
}

/** Which subscription plan a Dodo product belongs to. */
export function planForProduct(id: string | null | undefined): PlanId | null {
  if (!id) return null;
  for (const plan of ['monitor', 'agency'] as const) {
    if (process.env[`DODO_PRODUCT_${plan.toUpperCase()}_USD`] === id || process.env[`DODO_PRODUCT_${plan.toUpperCase()}_INR`] === id) return plan;
  }
  return null;
}

export const isReportProduct = (id: string | null | undefined) =>
  Boolean(id) && (process.env.DODO_PRODUCT_REPORT_USD === id || process.env.DODO_PRODUCT_REPORT_INR === id);

async function dodo<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`, ...init.headers },
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Dodo ${init.method ?? 'GET'} ${path} failed: ${res.status} ${body.slice(0, 500)}`);
  }
  const text = await res.text();
  return (text ? JSON.parse(text) : null) as T;
}

type Meta = Record<string, string | number | boolean>;

export type DodoSubscription = {
  subscription_id: string;
  product_id: string;
  status: string; // pending | active | on_hold | paused | cancelled | failed | expired | past_due
  customer: { customer_id: string; email: string; name?: string };
  metadata?: Meta;
};

export type DodoPayment = {
  payment_id: string;
  status?: string | null; // succeeded | failed | cancelled | processing | requires_* ...
  subscription_id?: string | null;
  customer: { customer_id: string; email: string };
  metadata?: Meta;
  total_amount?: number;
  currency?: string;
  product_cart?: Array<{ product_id: string; quantity: number }> | null;
};

/** Hosted checkout. Returns the URL to send the buyer to. */
export async function createCheckout(opts: { productId: string; email?: string | null; metadata: Meta; returnUrl: string }) {
  const res = await dodo<{ session_id: string; checkout_url: string }>('/checkouts', {
    method: 'POST',
    body: JSON.stringify({
      product_cart: [{ product_id: opts.productId, quantity: 1 }],
      ...(opts.email ? { customer: { email: opts.email } } : {}),
      metadata: opts.metadata,
      return_url: opts.returnUrl,
    }),
  });
  return res.checkout_url;
}

export const getSubscription = (id: string) => dodo<DodoSubscription>(`/subscriptions/${encodeURIComponent(id)}`);
export const getPayment = (id: string) => dodo<DodoPayment>(`/payments/${encodeURIComponent(id)}`);

export const tagSubscription = (id: string, metadata: Meta) =>
  dodo(`/subscriptions/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ metadata }) });

/** Moves an existing subscription to another plan; access changes only once the difference is paid. */
export async function changePlan(subscriptionId: string, newProductId: string) {
  await dodo(`/subscriptions/${encodeURIComponent(subscriptionId)}/change-plan`, {
    method: 'POST',
    body: JSON.stringify({ product_id: newProductId, quantity: 1, proration_billing_mode: 'prorated_immediately', on_payment_failure: 'prevent_change' }),
  });
}

/** Signed customer-portal link (invoices, payment method, cancel). */
export async function customerPortalUrl(customerId: string, returnUrl: string) {
  const res = await dodo<{ link: string }>(
    `/customers/${encodeURIComponent(customerId)}/customer-portal/session?return_url=${encodeURIComponent(returnUrl)}`,
    { method: 'POST' },
  );
  return res.link;
}

/** active, or past_due inside Dodo's retry grace period, keep paid access. */
export const keepsAccess = (status: string) => status === 'active' || status === 'past_due';

export function userBillingState(sub: DodoSubscription) {
  const plan = planForProduct(sub.product_id);
  const terminal = sub.status === 'expired' || sub.status === 'failed' || sub.status === 'cancelled';
  return {
    plan: keepsAccess(sub.status) && plan ? plan : 'free',
    subscriptionStatus: sub.status,
    billingSubscriptionId: terminal ? null : sub.subscription_id,
    billingCustomerId: sub.customer.customer_id,
  };
}

export const paymentSucceeded = (p: DodoPayment) => p.status === 'succeeded';
