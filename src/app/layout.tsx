import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'AskRank — AI Assistant Visibility & GEO for Shopify Stores',
  description: 'See whether ChatGPT, Perplexity, Gemini, and Google AI recommend your products, and fix your product data to dominate conversational shopping.',
  keywords: ['GEO', 'Generative Engine Optimization', 'Shopify AI', 'Perplexity SEO', 'ChatGPT Search Shopping', 'AI Visibility Score', 'Shopify Schema Fixes'],
  openGraph: {
    title: 'AskRank — Does AI Recommend Your Shopify Products?',
    description: 'Free AI Visibility Scan for Shopify Stores. Query ChatGPT, Perplexity, and Gemini for buyer recommendations.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#080c14] text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
