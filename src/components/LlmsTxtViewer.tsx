'use client';

import React, { useState } from 'react';
import { Copy, Check, Download, FileText, Globe, Sparkles, ExternalLink } from 'lucide-react';

interface LlmsTxtViewerProps {
  llmsTxtContent: string;
  aboutPageContent: string;
  domain: string;
}

export default function LlmsTxtViewer({
  llmsTxtContent,
  aboutPageContent,
  domain
}: LlmsTxtViewerProps) {
  const [activeTab, setActiveTab] = useState<'llms' | 'about'>('llms');
  const [copied, setCopied] = useState(false);

  const currentContent = activeTab === 'llms' ? llmsTxtContent : aboutPageContent;
  const filename = activeTab === 'llms' ? 'llms.txt' : 'about-us-ai-optimized.md';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <h3 className="text-base font-bold text-white">Machine-Readable AI Crawler Files</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standard files hosted at <code className="text-emerald-400 font-mono">https://{domain}/llms.txt</code> to guide Perplexity, ChatGPT, and Gemini bots directly to your core catalog.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('llms')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'llms'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>llms.txt</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'about'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>About Page Suggestions</span>
          </button>
        </div>
      </div>

      {/* Info Alert */}
      <div className="my-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
        <div>
          {activeTab === 'llms' ? (
            <span>
              <strong>Why llms.txt?</strong> Anthropic, OpenAI, and Perplexity crawl <code>/llms.txt</code> to parse your brand overview, price range, and return guarantees in clean markdown without navigating bloated HTML scripts.
            </span>
          ) : (
            <span>
              <strong>Why an AI-Optimized About Page?</strong> Conversational shopping models cite your brand story and quality certifications when shoppers ask &quot;Is this brand reliable?&quot;.
            </span>
          )}
        </div>
      </div>

      {/* Code Container */}
      <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/50">
          <span className="text-[11px] font-mono text-slate-400">{filename}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <pre className="p-4 text-xs font-mono text-emerald-300/90 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
          {currentContent}
        </pre>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
        <span>Shopify deployment tip: Upload file to your Shopify Admin &gt; Files or serve via Shopify App proxy.</span>
        <a
          href="https://llmstxt.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-emerald-400 hover:underline"
        >
          llmstxt.org docs <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
