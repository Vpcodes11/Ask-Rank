'use client';

import { useState } from 'react';

export default function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    setError(null);
    try {
      const res = await fetch('/api/auth/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, next }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send the email');
      setState('sent');
    } catch (err) {
      setError((err as Error).message);
      setState('idle');
    }
  };

  if (state === 'sent')
    return (
      <div className="mt-8 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-sm text-emerald-200">
        Check <b>{email}</b> for a sign-in link. It expires in 20 minutes. Not there? Check spam, or{' '}
        <button className="underline" onClick={() => setState('idle')}>try again</button>.
      </div>
    );

  return (
    <form onSubmit={submit} className="mt-8 space-y-3">
      <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourstore.com" className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-sm focus:outline-none focus:border-emerald-500" />
      <button disabled={state === 'sending'} className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-bold disabled:opacity-60">
        {state === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
      </button>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </form>
  );
}
