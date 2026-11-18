'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Download, Share2, Twitter, Linkedin, ExternalLink } from 'lucide-react';
import { ScanRecord } from '@/lib/types';

interface ShareCardModalProps {
  scan: ScanRecord;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareCardModal({ scan, isOpen, onClose }: ShareCardModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);

  if (!isOpen) return null;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/scan/${scan.id}`
    : `https://askrank.ai/scan/${scan.id}`;

  const ogImageUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/og/${scan.id}`
    : `/api/og/${scan.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyImageUrl = () => {
    navigator.clipboard.writeText(ogImageUrl);
    setCopiedImage(true);
    setTimeout(() => setCopiedImage(false), 2000);
  };

  const shareText = encodeURIComponent(
    `Our Shopify store "${scan.store_name}" just scored ${scan.score}/100 on AskRank AI Visibility! Does ChatGPT & Perplexity recommend your products? Check your GEO rank:`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Share AI Visibility Result Card</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Preview */}
        <div className="my-5">
          <p className="text-xs text-slate-400 mb-2">Live dynamic OpenGraph scorecard for {scan.store_name}:</p>
          <div className="rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-inner group relative">
            <img
              src={ogImageUrl}
              alt={`${scan.store_name} AI Visibility Card`}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition-colors shrink-0"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Copied Link!' : 'Copy Link'}
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2">
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <Twitter className="w-3.5 h-3.5 text-sky-400" /> Share on X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-400" /> Share on LinkedIn
              </a>
            </div>

            <a
              href={ogImageUrl}
              download={`${scan.store_name}-askrank-card.svg`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" /> Download Card SVG
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
