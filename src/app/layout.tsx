import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getUser } from '@/lib/auth';
import { appUrl } from '@/lib/util';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: 'AskRank: does AI recommend your store?',
  description: 'Free check: we ask ChatGPT Search, Perplexity and Gemini the questions your shoppers ask, and show whether they recommend you or your competitors.',
  openGraph: {
    title: 'AskRank: does AI recommend your store?',
    description: 'Free AI visibility check for online stores. Real answers from ChatGPT Search, Perplexity and Gemini.',
    type: 'website',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser().catch(() => null);
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
        <Navbar signedIn={Boolean(user)} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
