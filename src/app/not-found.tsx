import Link from 'next/link';
import { AlertCircle, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-500/10">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-white">Resource Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm mt-2 mb-6">
        The scan ID, store, or page you requested does not exist or may have expired.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Run Free Scan</span>
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
