import React from 'react';
import { EngineId } from '@/lib/types';
import { Bot, Search, Sparkles, Globe } from 'lucide-react';

interface EngineBadgeProps {
  engine: EngineId;
  size?: 'sm' | 'md';
}

export default function EngineBadge({ engine, size = 'md' }: EngineBadgeProps) {
  const configs = {
    perplexity: {
      name: 'Perplexity Sonar',
      icon: Search,
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400',
    },
    openai_search: {
      name: 'ChatGPT Search',
      icon: Bot,
      bg: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
      dot: 'bg-teal-400',
    },
    gemini_grounding: {
      name: 'Gemini Grounding',
      icon: Sparkles,
      bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
      dot: 'bg-blue-400',
    },
    google_aio: {
      name: 'Google AI Overviews',
      icon: Globe,
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      dot: 'bg-rose-400',
    },
  };

  const c = configs[engine] || configs.perplexity;
  const Icon = c.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium border rounded-md ${c.bg} ${size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      <Icon className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      <span>{c.name}</span>
    </span>
  );
}
