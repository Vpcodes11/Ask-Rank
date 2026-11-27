import { safeNext } from '@/lib/auth';

export const metadata = { title: 'Sign in | AskRank', robots: { index: false } };

/** Landing page for the emailed link. The button POSTs the token, so link scanners can't use it up. */
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string; next?: string }> }) {
  const { token, next } = await searchParams;
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-black text-white">Sign in to AskRank</h1>
      <form action="/api/auth/verify" method="post" className="mt-8">
        <input type="hidden" name="token" value={token || ''} />
        <input type="hidden" name="next" value={safeNext(next)} />
        <button className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold">Continue</button>
      </form>
    </div>
  );
}
