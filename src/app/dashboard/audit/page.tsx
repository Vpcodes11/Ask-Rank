'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Sliders,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Layers,
  FileCode2,
  ChevronRight,
  Loader2
} from 'lucide-react';
import StructuredDataChecker from '@/components/StructuredDataChecker';
import LlmsTxtViewer from '@/components/LlmsTxtViewer';
import { ShopifyProduct, StoreRecord } from '@/lib/types';
import { generateLlmsTxt, generateAboutPageSuggestion } from '@/lib/audit-engine';

export default function DeepAuditPage() {
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [store, setStore] = useState<StoreRecord | null>(null);
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ShopifyProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'schema' | 'gaps' | 'llms'>('schema');

  useEffect(() => {
    async function loadData() {
      try {
        const storeRes = await fetch('/api/stores');
        const storeData = await storeRes.json();
        if (storeData.stores && storeData.stores.length > 0) {
          setStores(storeData.stores);
          const current = storeData.stores[0];
          setStore(current);

          // Get products from db (via suggestions or product endpoint)
          // For demo, load store products
          const res = await fetch(`/api/stores/${current.id}/sync`, { method: 'POST' });
          const syncData = await res.json();
          if (syncData.store) {
            setStore(syncData.store);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Fetch product list for current store
  useEffect(() => {
    if (!store) return;
    const storeId = store.id;
    async function loadProducts() {
      try {
        const res = await fetch(`/api/products?store_id=${storeId}`);
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          setSelectedProduct(data.products[0]);
        }
      } catch (err) {
        console.error('Failed to load products for store:', err);
      }
    }
    loadProducts();
  }, [store]);

  if (loading || !store) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
        <h3 className="text-lg font-bold text-white">Loading Deep Audit Engine...</h3>
      </div>
    );
  }

  const llmsTxt = generateLlmsTxt(store.store_name, store.shopify_domain, products);
  const aboutPage = generateAboutPageSuggestion(store.store_name, 'Activewear & Fitness Apparel');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
              Deep Catalog Audit
            </span>
            <span className="text-xs text-slate-400 font-mono">{store.shopify_domain}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Structured Data & Content Gap Analysis
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Shopify schemas, technical specifications, and crawler-ready files (llms.txt) to maximize conversational AI indexing.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'schema'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Structured Data (JSON-LD)
          </button>
          <button
            onClick={() => setActiveTab('gaps')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'gaps'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Content Gaps ({store.avg_gap_score}%)
          </button>
          <button
            onClick={() => setActiveTab('llms')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'llms'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            llms.txt & About Page
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      {activeTab === 'schema' && (
        <div className="my-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Product Selector Sidebar */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Synced Shopify Products ({products.length})
            </h3>

            <div className="space-y-2">
              {products.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-emerald-500 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white truncate">{p.title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>₹{p.price}</span>
                          <span>•</span>
                          <span className={p.schema_data.has_product_schema ? 'text-emerald-400' : 'text-rose-400'}>
                            {p.schema_data.has_product_schema ? 'Schema Active' : 'No Schema'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 mt-3 transition-transform ${isSelected ? 'text-emerald-400 translate-x-1' : 'text-slate-600'}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-xs text-slate-400 space-y-2 mt-4">
              <div className="flex items-center gap-1.5 text-slate-300 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>AggregateRating Schema Guard</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                We strictly audit <code>AggregateRating</code>: false 5.0 star schemas with zero or unverified reviewCount are penalized by Google and AI shopping agents.
              </p>
            </div>
          </div>

          {/* Schema Inspector Panel */}
          <div className="lg:col-span-7">
            {selectedProduct ? (
              <StructuredDataChecker product={selectedProduct} storeName={store.store_name} />
            ) : (
              <div className="p-8 text-center text-slate-500">Select a product to inspect schemas.</div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'gaps' && (
        <div className="my-8 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Product Content Gap Engine</span>
              </div>
              <h3 className="text-xl font-black text-white mt-1">Why Competitors Rank Higher on ChatGPT & Perplexity</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                When shoppers ask conversational questions (&quot;Will an iPhone fit? Does it pill after washing? How does it compare to Lululemon?&quot;), standard Shopify descriptions lack the semantic anchors AI models look for.
              </p>
            </div>

            <Link
              href="/dashboard/content-fixer"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shrink-0 shadow-md shadow-emerald-500/20"
            >
              <Sliders className="w-4 h-4" />
              <span>Review AI Content Fixes &rarr;</span>
            </Link>
          </div>

          {/* Gaps Breakdown List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((p) => (
              <div key={p.id} className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-white truncate max-w-[280px]">{p.title}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    Gap Score: {p.content_gap_score}%
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Technical Specs & Dimensions</span>
                    <span className={p.content_gaps.missing_specs ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                      {p.content_gaps.missing_specs ? 'Missing' : 'Present'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Target Buyer Use-Cases</span>
                    <span className={p.content_gaps.missing_use_cases ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                      {p.content_gaps.missing_use_cases ? 'Missing' : 'Present'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Competitor Comparison Anchors</span>
                    <span className={p.content_gaps.missing_comparisons ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                      {p.content_gaps.missing_comparisons ? 'Missing' : 'Present'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Material / Composition</span>
                    <span className={p.content_gaps.missing_materials ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                      {p.content_gaps.missing_materials ? 'Missing' : 'Present'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Shopper FAQ Blocks</span>
                    <span className={p.content_gaps.missing_faqs ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                      {p.content_gaps.missing_faqs ? 'Missing' : 'Present'}
                    </span>
                  </div>
                </div>

                <Link
                  href="/dashboard/content-fixer"
                  className="pt-2 text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  Generate enriched content for this product &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'llms' && (
        <div className="my-8">
          <LlmsTxtViewer
            llmsTxtContent={llmsTxt}
            aboutPageContent={aboutPage}
            domain={store.shopify_domain}
          />
        </div>
      )}

    </div>
  );
}
