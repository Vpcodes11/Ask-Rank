'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function Navbar({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  if (pathname === '/') return null; // the homepage hero has its own header

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#080c14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <span className="hidden sm:inline text-xl font-black tracking-tight text-white">AskRank</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-medium whitespace-nowrap">
          <Link href="/#scan" className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60">Free scan</Link>
          <Link href="/pricing" className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60">Pricing</Link>
          <Link
            href={signedIn ? '/dashboard' : '/login'}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
          >
            {signedIn ? 'Dashboard' : 'Sign in'}
          </Link>
        </nav>
      </div>
    </header>
  );
}
