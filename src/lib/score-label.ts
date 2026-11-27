/** Client-safe score labels (no server imports). */
export function getScoreLabel(score: number): { label: string; color: string; hex: string; bg: string; description: string } {
  if (score >= 70)
    return { label: 'Strong AI presence', color: 'text-emerald-400', hex: '#34d399', bg: 'bg-emerald-500/10 border-emerald-500/30', description: 'AI assistants regularly recommend you for buyer questions in your category.' };
  if (score >= 45)
    return { label: 'Moderate AI presence', color: 'text-teal-400', hex: '#2dd4bf', bg: 'bg-teal-500/10 border-teal-500/30', description: 'You appear in some answers, but competitors win many of the questions you should own.' };
  if (score >= 20)
    return { label: 'Low AI visibility', color: 'text-amber-400', hex: '#fbbf24', bg: 'bg-amber-500/10 border-amber-500/30', description: 'AI assistants mostly recommend other brands when shoppers ask about your category.' };
  return { label: 'Nearly invisible to AI', color: 'text-rose-400', hex: '#fb7185', bg: 'bg-rose-500/10 border-rose-500/30', description: 'AI assistants rarely or never name you when shoppers ask about your category.' };
}
