'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Loader2, Copy, Check } from 'lucide-react';
import type { DeepAudit } from '@/lib/types';

type AuditResponse = { audit: DeepAudit; llmsTxt: string; productSchemas: Array<{ title: string; url: string; jsonLd: string }> };

export default function DeepAuditPanel({ scanId }: { scanId: string }) {
  const [data, setData] = useState<AuditResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/scan/${scanId}/audit`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Could not load the audit');
        setData(j);
      })
      .catch((e) => setError(e.message));
  }, [scanId]);

  if (error) return <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-sm text-rose-300">{error}</div>;
  if (!data)
    return (
      <div className="p-10 rounded-3xl border border-slate-800 bg-slate-900/60 text-center text-sm text-slate-300">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mx-auto mb-3" />
        Checking product pages and structured data… (up to a minute the first time)
      </div>
    );

  const { audit, llmsTxt, productSchemas } = data;
  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-400">Deep Audit</span>
        <h2 className="text-xl font-black text-white mt-1">What to fix first</h2>
        <ol className="mt-4 space-y-2 list-decimal pl-5 text-sm text-slate-300">
          {audit.recommendations.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <Flag ok={audit.site.hasOrganizationSchema} label="Organization structured data" />
        <Flag ok={audit.site.hasLlmsTxt} label="/llms.txt" />
        <Flag ok={audit.site.hasSitemap} label="sitemap.xml" />
        <Flag ok={audit.site.productsJsonPublic} label="Public product feed" />
      </div>

      <div>
        <h3 className="text-base font-bold text-white mb-3">Product pages</h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-xs">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="text-left p-3">Product</th>
                <th className="p-3">Product schema</th>
                <th className="p-3">Price & stock</th>
                <th className="p-3">Reviews markup</th>
                <th className="p-3">FAQ schema</th>
                <th className="text-left p-3">Gaps</th>
              </tr>
            </thead>
            <tbody>
              {audit.products.map((p) => (
                <tr key={p.url} className="border-t border-slate-800 align-top">
                  <td className="p-3">
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-emerald-400 font-semibold">{p.title}</a>
                    <div className="text-slate-500">{p.descriptionWords} words · gap score {p.gapScore}</div>
                  </td>
                  {p.fetched ? (
                    <>
                      <Cell ok={p.hasProductSchema} />
                      <Cell ok={p.hasPrice && p.hasAvailability} />
                      <td className="p-3 text-center">{p.hasAggregateRating ? <Cell ok={!p.ratingIssue} bare /> : <span className="text-slate-500">none</span>}</td>
                      <Cell ok={p.hasFaqSchema} />
                    </>
                  ) : (
                    <td colSpan={4} className="p-3 text-center text-slate-500">Page could not be loaded</td>
                  )}
                  <td className="p-3 text-slate-400">
                    <ul className="list-disc pl-4 space-y-0.5">
                      {p.gaps.map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
              {audit.products.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">No public products were found to audit.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold text-white mb-1">Sites that cite your competitors</h3>
        <p className="text-xs text-slate-400 mb-3">From answers that recommended other brands and not you. Getting listed, reviewed or mentioned here is how you get into those answers.</p>
        {audit.citationTargets.length === 0 ? (
          <p className="text-xs text-slate-500">None found in this scan.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-2">
            {audit.citationTargets.map((t) => (
              <a key={t.domain} href={t.url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 text-xs">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-200">{t.domain}</span>
                  <span className="text-emerald-400">{t.count}×</span>
                </div>
                {t.competitorsNamed.length > 0 && <div className="text-slate-500 mt-1">Named: {t.competitorsNamed.join(', ')}</div>}
              </a>
            ))}
          </div>
        )}
      </div>

      <CodeBlock title="llms.txt draft" hint="Upload as a file at yourstore.com/llms.txt (in Shopify: Content → Files, then a URL redirect, or ask your developer). Replace anything in [ADD: …]." code={llmsTxt} />
      {productSchemas.map((s) => (
        <CodeBlock key={s.url} title={`Product JSON-LD: ${s.title}`} hint="Only needed if the product page has no Product schema above. Built from your live product data." code={s.jsonLd} />
      ))}
    </div>
  );
}

function Flag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`p-3 rounded-xl border flex items-center gap-2 ${ok ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300' : 'border-rose-500/30 bg-rose-500/5 text-rose-300'}`}>
      {ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} {label}
    </div>
  );
}

function Cell({ ok, bare }: { ok: boolean; bare?: boolean }) {
  const icon = ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400 inline" /> : <XCircle className="w-4 h-4 text-rose-400 inline" />;
  return bare ? icon : <td className="p-3 text-center">{icon}</td>;
}

export function CodeBlock({ title, hint, code }: { title: string; hint?: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {hint && <p className="text-[11px] text-slate-500 mb-2">{hint}</p>}
      <pre className="text-[11px] text-slate-300 bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto max-h-80 whitespace-pre-wrap">{code}</pre>
    </div>
  );
}
