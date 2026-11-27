import Link from 'next/link';

export default function Footer() {
  const support = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  return (
    <footer className="border-t border-slate-800/80 py-10 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-white">AskRank</span> · Find out if AI assistants recommend your store.
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-5">
          <Link href="/#scan" className="hover:text-slate-300">Free scan</Link>
          <Link href="/pricing" className="hover:text-slate-300">Pricing</Link>
          <Link href="/privacy" className="hover:text-slate-300">Privacy</Link>
          <Link href="/terms" className="hover:text-slate-300">Terms</Link>
          {support && <a href={`mailto:${support}`} className="hover:text-slate-300">Contact</a>}
        </nav>
        <div>© {new Date().getFullYear()} AskRank</div>
      </div>
    </footer>
  );
}
