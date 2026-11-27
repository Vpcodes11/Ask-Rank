import { redirect } from 'next/navigation';
import { getUser, safeNext } from '@/lib/auth';
import LoginForm from './LoginForm';

export const metadata = { title: 'Sign in | AskRank' };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const dest = safeNext(next);
  if (await getUser()) redirect(dest);
  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-2xl font-black text-white">Sign in</h1>
      <p className="text-sm text-slate-400 mt-2">We&apos;ll email you a sign-in link. No password needed. New here? This creates your account.</p>
      {error === 'expired' && <p className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">That link has expired or was already used. Request a new one.</p>}
      <LoginForm next={dest} />
    </div>
  );
}
