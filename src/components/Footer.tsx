import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowUpRight, ShieldCheck, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#060911] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-white text-sm">AskRank</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Generative Engine Optimization (GEO) platform for Shopify brands. We track recommendations on ChatGPT, Perplexity, Gemini, and Google AI Overviews and fix your data.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live AI Grounding Engines Online
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 text-xs mb-3 uppercase tracking-wider">Features</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-emerald-400 transition-colors">Free Store Scan</Link></li>
              <li><Link href="/dashboard/audit" className="hover:text-emerald-400 transition-colors">Structured Data Audit</Link></li>
              <li><Link href="/dashboard/content-fixer" className="hover:text-emerald-400 transition-colors">AI Content Fixer (Human in the loop)</Link></li>
              <li><Link href="/dashboard/citations" className="hover:text-emerald-400 transition-colors">Competitor Citation Spy</Link></li>
              <li><Link href="/dashboard/monitor" className="hover:text-emerald-400 transition-colors">Weekly Automated Tracking</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 text-xs mb-3 uppercase tracking-wider">Engines Supported</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-1.5"><Cpu className="w-3 h-3 text-emerald-400" /> Perplexity Sonar API</li>
              <li className="flex items-center gap-1.5"><Cpu className="w-3 h-3 text-teal-400" /> OpenAI Search (GPT-4o)</li>
              <li className="flex items-center gap-1.5"><Cpu className="w-3 h-3 text-blue-400" /> Gemini Search Grounding</li>
              <li className="flex items-center gap-1.5"><Cpu className="w-3 h-3 text-rose-400" /> Google AI Overviews</li>
              <li className="flex items-center gap-1.5"><Cpu className="w-3 h-3 text-purple-400" /> Pluggable Engine Adapter</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 text-xs mb-3 uppercase tracking-wider">GEO Standards</h4>
            <ul className="space-y-2">
              <li><a href="https://llmstxt.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-emerald-400 transition-colors">llms.txt Standard <ArrowUpRight className="w-3 h-3" /></a></li>
              <li><a href="https://schema.org/Product" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-emerald-400 transition-colors">Schema.org Product Specs <ArrowUpRight className="w-3 h-3" /></a></li>
              <li><Link href="/dashboard/audit" className="hover:text-emerald-400 transition-colors">Review Schema Validity Rules</Link></li>
              <li><Link href="/pricing" className="hover:text-emerald-400 transition-colors">Pricing & Plans</Link></li>
            </ul>
          </div>

        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>© {new Date().getFullYear()} AskRank AI. Built for direct-to-consumer Shopify sellers.</div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Never auto-publishes without approval</span>
            <span>•</span>
            <span>Shopify Partner Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
