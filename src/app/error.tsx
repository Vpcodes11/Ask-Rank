'use client';

import Link from 'next/link';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-black text-white">Something went wrong</h1>
      <p className="text-sm text-slate-400 mt-3">Please try again. If it keeps happening, contact us and we&apos;ll look into it.</p>
      <div className="flex justify-center gap-2 mt-8">
        <button onClick={reset} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold">Try again</button>
        <Link href="/" className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold">Home</Link>
      </div>
    </div>
  );
}
