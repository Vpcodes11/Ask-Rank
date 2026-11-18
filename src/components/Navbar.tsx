'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Search,
  Sliders,
  FileCheck2,
  Share2,
  TrendingUp,
  Store,
  Layers,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');

  if (pathname === '/') {
    return null; // Homepage uses the panoramic in-window Railroad.ai navigation
  }

  const navLinks = [
    { href: '/', label: 'Free Scan', icon: Search },
    { href: '/dashboard/audit', label: 'Deep Audit', icon: FileCheck2 },
    { href: '/dashboard/content-fixer', label: 'AI Content Fixer', icon: Sliders },
    { href: '/dashboard/citations', label: 'Citation PR Map', icon: Share2 },
    { href: '/dashboard/monitor', label: 'Weekly Monitor', icon: TrendingUp },
    { href: '/pricing', label: 'Pricing', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#080c14]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">AskRank</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">GEO</span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block -mt-1 font-mono">AI Recommendation Engine for Shopify</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Currency Toggle */}
          <button
            onClick={() => setCurrency(c => c === 'INR' ? 'USD' : 'INR')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 transition-colors"
            title="Toggle Currency Display"
          >
            <span>{currency === 'INR' ? '🇮🇳 ₹ INR' : '🇺🇸 $ USD'}</span>
          </button>

          {/* Connect Store Button / Dashboard Link */}
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 hover:scale-[1.02]"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Connect Store</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
