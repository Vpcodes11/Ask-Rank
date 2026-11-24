import React from 'react';
import { getScoreLabel } from '@/lib/score-label';

export default function ScoreGauge({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const info = getScoreLabel(score);
  const radius = size === 'lg' ? 70 : size === 'md' ? 52 : 36;
  const stroke = size === 'lg' ? 10 : size === 'md' ? 8 : 6;
  const r = radius - stroke * 2;
  const c = r * 2 * Math.PI;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]" aria-hidden>
          <circle stroke="#1e293b" fill="transparent" strokeWidth={stroke} r={r} cx={radius} cy={radius} />
          <circle
            stroke={info.hex}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${c} ${c}`}
            style={{ strokeDashoffset: c - (score / 100) * c }}
            strokeLinecap="round"
            r={r}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`font-black tracking-tight ${size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-3xl' : 'text-xl'}`} style={{ color: info.hex }}>
            {score}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 -mt-1 uppercase tracking-widest">/ 100</span>
        </div>
      </div>
      <div className={`mt-3 px-3 py-1 rounded-full text-xs font-bold border ${info.bg} ${info.color}`}>{info.label}</div>
    </div>
  );
}
