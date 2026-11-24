import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { billingEnabled, customerPortalUrl } from '@/lib/billing';
import { appUrl } from '@/lib/util';

export async function POST() {
  const base = appUrl();
  const user = await getUser();
  if (!user) return NextResponse.redirect(`${base}/login?next=/dashboard`, 303);
  if (!billingEnabled() || !user.billingCustomerId) return NextResponse.redirect(`${base}/dashboard`, 303);
  try {
    return NextResponse.redirect(await customerPortalUrl(user.billingCustomerId, `${base}/dashboard`), 303);
  } catch (e) {
    console.error('customer portal failed', e);
    return NextResponse.redirect(`${base}/dashboard?error=portal`, 303);
  }
}
