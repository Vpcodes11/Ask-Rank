'use client';

import React from 'react';
import { getScoreLabel } from '@/lib/scoring';
import { ScanBreakdown } from '@/lib/types';
import { Sparkles, TrendingUp, Target, Layers } from 'lucide-react';

interface ScoreGaugeProps {
  score: number;
  breakdown?: ScanBreakdown;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
}

export default function ScoreGauge({
  score,
  breakdown,
  size = 'md',
  showBreakdown = true
}: ScoreGaugeProps) {
  const labelInfo = getScoreLabel(score);

  // Radial calculation
  const radius = size === 'lg' ? 70 : size === 'md' ? 52 : 36;
  const stroke = size === 'lg' ? 10 : size === 'md' ? 8 : 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const colorClass =
    score >= 80 ? '#10b981' :
    score >= 60 ? '#2dd4bf' :
    score >= 40 ? '#f59e0b' :
    score >= 20 ? '#fb923c' : '#f43f5e';

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="rotate-[-90deg] transition-all duration-1000 ease-out"
        >
          {/* Background Track */}
          <circle
            stroke="#1e293b"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress Arc */}
          <circle
            stroke={colorClass}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-black tracking-tight ${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-3xl' : 'text-xl'}`} style={{ color: colorClass }}>
            {score}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 -mt-1 uppercase tracking-widest">
            / 100
          </span>
        </div>
      </div>

      {/* Label Badge */}
      <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${labelInfo.bg} ${labelInfo.color}`}>
        {labelInfo.label}
      </div>

      {showBreakdown && breakdown && (
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 text-center">
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-medium">Mention Rate</div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">{breakdown.mention_rate}%</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-medium">Avg Rec Rank</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">#{breakdown.avg_position || 'N/A'}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-medium">Engine Diversity</div>
            <div className="text-sm font-bold text-teal-400 mt-0.5">{breakdown.engine_diversity}%</div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-medium">Source Authority</div>
            <div className="text-sm font-bold text-purple-400 mt-0.5">{breakdown.source_authority}%</div>
          </div>
        </div>
      )}
    </div>
  );
}
