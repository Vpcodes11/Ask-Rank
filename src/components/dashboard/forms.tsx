'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

async function call(url: string, method: string, body?: unknown) {
  const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export function AddStoreForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [niche, setNiche] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="mt-4 p-4 rounded-xl border border-dashed border-slate-700 grid sm:grid-cols-[1fr_1fr_auto] gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          const { store } = await call('/api/stores', 'POST', { url, niche });
          router.push(`/dashboard/stores/${store.id}`);
        } catch (err) {
          setError((err as Error).message);
          setBusy(false);
        }
      }}
    >
      <input required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="yourstore.com" className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm" />
      <input value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Category (optional), e.g. vegan skincare" className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm" />
      <button disabled={busy} className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold disabled:opacity-60">{busy ? 'Adding…' : 'Track store'}</button>
      {error && <p className="text-xs text-rose-400 sm:col-span-3">{error}</p>}
    </form>
  );
}

export function AgencyNameForm({ initial }: { initial: string }) {
  const [name, setName] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await call('/api/account', 'PATCH', { agencyName: name });
          setMsg('Saved');
        } catch (err) {
          setMsg((err as Error).message);
        }
      }}
    >
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Your agency name" className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm" />
      <button className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold">Save</button>
      {msg && <span className="text-xs text-slate-400 self-center">{msg}</span>}
    </form>
  );
}

export function StoreActions({ storeId }: { storeId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            const { scanId } = await call(`/api/stores/${storeId}/run`, 'POST');
            router.push(`/scan/${scanId}`);
          } catch (err) {
            setError((err as Error).message);
            setBusy(false);
          }
        }}
        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold disabled:opacity-60"
      >
        Run now
      </button>
      <button
        onClick={async () => {
          if (!confirm('Stop tracking this store? Its history and drafts will be deleted.')) return;
          try {
            await call(`/api/stores/${storeId}`, 'DELETE');
            router.push('/dashboard');
            router.refresh();
          } catch (err) {
            setError((err as Error).message);
          }
        }}
        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs"
      >
        Remove store
      </button>
      {error && <span className="text-xs text-rose-400">{error}</span>}
    </div>
  );
}
