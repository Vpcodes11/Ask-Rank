'use client';

import { useState } from 'react';
import { CodeBlock } from '@/components/DeepAuditPanel';

type Fix = { id: string; productTitle: string; type: string; after: string; status: string; createdAt: string | Date };
const TYPES = [
  { id: 'description', label: 'Product description' },
  { id: 'faqs', label: 'FAQs (+ FAQPage schema)' },
  { id: 'schema', label: 'Product JSON-LD' },
] as const;

export default function ContentFixer({ storeId, products, initialFixes }: { storeId: string; products: Array<{ handle: string; title: string }>; initialFixes: Fix[] }) {
  const [fixes, setFixes] = useState<Fix[]>(initialFixes);
  const [handle, setHandle] = useState(products[0]?.handle || '');
  const [type, setType] = useState<(typeof TYPES)[number]['id']>('description');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/stores/${storeId}/fix`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ handle, type }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Drafting failed');
      setFixes([data.fix, ...fixes]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const mark = async (id: string, status: string) => {
    const res = await fetch(`/api/fixes/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (res.ok) setFixes(fixes.map((f) => (f.id === id ? { ...f, status } : f)));
  };

  if (products.length === 0) return <p className="text-xs text-slate-500">No public products were found in the latest scan, so there is nothing to draft yet.</p>;

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 grid sm:grid-cols-[2fr_1fr_auto] gap-2">
        <select value={handle} onChange={(e) => setHandle(e.target.value)} className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm">
          {products.map((p) => (
            <option key={p.handle} value={p.handle}>{p.title}</option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm">
          {TYPES.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
        <button onClick={generate} disabled={busy} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold disabled:opacity-60">
          {busy ? 'Drafting…' : 'Draft it'}
        </button>
        <p className="text-[11px] text-slate-500 sm:col-span-3">
          Drafts only use facts already in your product data. Anything missing is marked <code>[ADD: …]</code> for you to fill in. Paste approved text into Shopify yourself.
        </p>
        {error && <p className="text-xs text-rose-400 sm:col-span-3">{error}</p>}
      </div>

      {fixes.map((f) => (
        <div key={f.id} className={`p-4 rounded-xl border ${f.status === 'dismissed' ? 'border-slate-800 opacity-50' : 'border-slate-800 bg-slate-900/40'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="text-xs text-slate-400">
              <b className="text-slate-200">{f.productTitle}</b> · {TYPES.find((t) => t.id === f.type)?.label} · {new Date(f.createdAt).toLocaleDateString()}
              {f.status === 'applied' && <span className="ml-2 text-emerald-400">Applied</span>}
            </div>
            <div className="flex gap-2 text-[11px]">
              {f.status !== 'applied' && <button onClick={() => mark(f.id, 'applied')} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700">Mark applied</button>}
              {f.status !== 'dismissed' && <button onClick={() => mark(f.id, 'dismissed')} className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700">Dismiss</button>}
            </div>
          </div>
          <CodeBlock title="Draft" code={f.after} />
        </div>
      ))}
    </div>
  );
}
