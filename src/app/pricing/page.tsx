import PricingTable from '@/components/PricingTable';
import { getUser } from '@/lib/auth';
import type { PlanId } from '@/lib/plans';

export const metadata = { title: 'Pricing | AskRank' };

const ERRORS: Record<string, string> = {
  billing: 'Payments are not switched on yet. Please try again soon.',
  checkout: 'We could not open the checkout. Please try again.',
  scan: 'That scan was not found or has not finished.',
};

const FAQ = [
  {
    q: 'How do you test whether AI assistants recommend us?',
    a: 'We send realistic buyer questions for your category to the live APIs of ChatGPT (with web search), Perplexity and Gemini (with Google Search grounding), then record whether each answer names you, where you rank, which competitors it names and which sites it cites.',
  },
  {
    q: 'Are the results the same as what my customers see?',
    a: 'They are real answers from the same models with live web search, but AI answers vary between runs, accounts and locations. That is why the weekly monitor tracks the trend over many questions rather than any single answer.',
  },
  {
    q: 'Will AskRank change my Shopify store?',
    a: 'No. AskRank never connects to your store admin. The Content Fixer drafts descriptions, FAQs and structured data from your existing product data, and you paste what you approve into Shopify yourself.',
  },
  {
    q: 'Can I cancel?',
    a: 'Yes. Open your dashboard, choose Manage billing, and cancel. You keep access until the end of the period you paid for.',
  },
];

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ error?: string; currency?: string }> }) {
  const { error, currency } = await searchParams;
  const user = await getUser();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Simple pricing</h1>
        <p className="text-sm text-slate-400 mt-4">Start with a free scan. Pay once for a Deep Audit, or track your AI visibility every week.</p>
        {error && ERRORS[error] && <p className="mt-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">{ERRORS[error]}</p>}
      </div>
      <PricingTable currentPlan={(user?.plan as PlanId) || 'free'} defaultCurrency={currency === 'INR' ? 'INR' : 'USD'} />
      <div className="max-w-3xl mx-auto mt-20 pt-12 border-t border-slate-800">
        <h2 className="text-xl font-black text-white text-center mb-8">Questions</h2>
        <div className="space-y-4">
          {FAQ.map((f) => (
            <div key={f.q} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
              <h3 className="font-bold text-white text-sm">{f.q}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
