import Link from 'next/link';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { limitsFor } from '@/lib/monitor';
import { AddStoreForm, AgencyNameForm } from '@/components/dashboard/forms';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard | AskRank' };

const PLAN_NAME: Record<string, string> = { free: 'Free', monitor: 'Weekly Monitor', agency: 'Agency' };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ subscribed?: string; changed?: string; error?: string }> }) {
  const user = await requireUser('/dashboard');
  const q = await searchParams;
  const limits = limitsFor(user);
  const [stores, purchases, freeScans] = await Promise.all([
    db.store.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      include: { scans: { orderBy: { createdAt: 'desc' }, take: 1, select: { id: true, score: true, status: true, createdAt: true } } },
    }),
    db.purchase.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 20 }),
    db.scan.findMany({ where: { userId: user.id, kind: 'free' }, orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, domain: true, score: true, status: true, createdAt: true } }),
  ]);
  const purchasedScans = purchases.length
    ? await db.scan.findMany({ where: { id: { in: purchases.map((p) => p.scanId) } }, select: { id: true, domain: true, score: true } })
    : [];

  let notice: string | null = null;
  if (q.subscribed) notice = user.plan === 'free' ? 'Payment received. Your plan activates as soon as the payment is confirmed. Refresh in a minute.' : `Your ${PLAN_NAME[user.plan]} plan is active. Add your store below.`;
  if (q.changed) notice = 'Plan change requested. It applies as soon as the payment for the difference is confirmed.';
  if (q.error) notice = 'Something went wrong with billing. Please try again or contact us.';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-white">Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">{user.email}</p>
        </div>
        <form action="/api/auth/logout" method="post">
          <button className="text-xs text-slate-400 hover:text-white underline">Sign out</button>
        </form>
      </div>
      {notice && <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-sm">{notice}</div>}

      <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase text-slate-400 font-semibold">Plan</div>
          <div className="text-lg font-black text-white">{PLAN_NAME[user.plan] || user.plan}</div>
          {user.subscriptionStatus && user.plan !== 'free' && user.subscriptionStatus !== 'active' && (
            <div className="text-xs text-amber-300 mt-1">Subscription status: {user.subscriptionStatus}. Update your payment method to keep access.</div>
          )}
          {limits.stores > 0 && <div className="text-xs text-slate-400 mt-1">{stores.length} of {limits.stores} store{limits.stores > 1 ? 's' : ''} tracked · {limits.promptsPerRun} questions per weekly run</div>}
        </div>
        <div className="flex gap-2">
          {user.billingCustomerId && (
            <form action="/api/billing/portal" method="post">
              <button className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold">Manage billing</button>
            </form>
          )}
          <Link href="/pricing" className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold">
            {user.plan === 'free' ? 'See plans' : 'Change plan'}
          </Link>
        </div>
      </section>

      {limits.stores > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-3">Tracked stores</h2>
          <div className="space-y-2">
            {stores.map((s) => {
              const last = s.scans[0];
              return (
                <Link key={s.id} href={`/dashboard/stores/${s.id}`} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{s.name}</div>
                    <div className="text-[11px] text-slate-500">{s.domain} · next run {s.nextRunAt.toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    {last?.status === 'running' ? (
                      <span className="text-xs text-slate-400">Scanning…</span>
                    ) : last?.score != null ? (
                      <span className="text-xl font-black text-emerald-400">{last.score}<span className="text-xs text-slate-500">/100</span></span>
                    ) : (
                      <span className="text-xs text-slate-500">No score yet</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
          {stores.length < limits.stores ? <AddStoreForm /> : <p className="text-xs text-slate-500 mt-3">You&apos;re tracking the maximum for your plan.</p>}
        </section>
      )}

      {user.plan === 'agency' && (
        <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
          <h2 className="text-base font-bold text-white">Report branding</h2>
          <p className="text-xs text-slate-400 mt-1">Shown at the top of PDF reports you open while signed in.</p>
          <AgencyNameForm initial={user.agencyName || ''} />
        </section>
      )}

      {purchasedScans.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-3">Deep Audits you bought</h2>
          <div className="space-y-2">
            {purchasedScans.map((s) => (
              <Link key={s.id} href={`/scan/${s.id}#deep-audit`} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex justify-between text-sm">
                <span>{s.domain}</span>
                <span className="text-emerald-400 font-bold">{s.score ?? '–'}/100</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {freeScans.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-3">Your recent free scans</h2>
          <div className="space-y-2">
            {freeScans.map((s) => (
              <Link key={s.id} href={`/scan/${s.id}`} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex justify-between text-sm">
                <span>{s.domain} <span className="text-[11px] text-slate-500">· {s.createdAt.toLocaleDateString()}</span></span>
                <span className="text-slate-300">{s.status === 'done' ? `${s.score}/100` : s.status}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {user.plan === 'free' && stores.length === 0 && purchasedScans.length === 0 && (
        <section className="p-6 rounded-2xl border border-dashed border-slate-700 text-center">
          <p className="text-sm text-slate-300">Start with a free scan of your store, or pick a plan to track it every week.</p>
          <div className="flex justify-center gap-2 mt-4">
            <Link href="/#scan" className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold">Run a free scan</Link>
            <Link href="/pricing" className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold">See plans</Link>
          </div>
        </section>
      )}
    </div>
  );
}
