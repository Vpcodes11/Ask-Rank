import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { limitsFor } from '@/lib/monitor';
import { hit, refund } from '@/lib/rate-limit';
import { draftContentFix, type FixType } from '@/lib/audit-engine';
import { llmProvider } from '@/lib/llm';
import type { BuyerPrompt, StoreSnapshot } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Drafts a description / FAQ / JSON-LD for one product, from the latest scan's real product data. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 });
  const limits = limitsFor(user);
  if (limits.stores === 0) return NextResponse.json({ error: 'The Content Fixer is part of the Weekly Monitor and Agency plans.' }, { status: 402 });

  const body = await req.json().catch(() => ({}));
  const type = body.type as FixType;
  const handle = String(body.handle || '');
  if (!['description', 'faqs', 'schema'].includes(type) || !handle) return NextResponse.json({ error: 'Choose a product and what to write' }, { status: 400 });
  if (type !== 'schema' && !llmProvider()) return NextResponse.json({ error: 'AI drafting is not configured.' }, { status: 503 });

  const store = await db.store.findFirst({ where: { id, userId: user.id } });
  if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  const scan = await db.scan.findFirst({ where: { storeId: store.id, status: 'done' }, orderBy: { createdAt: 'desc' } });
  const snapshot = scan?.storeData as unknown as StoreSnapshot | null;
  const product = snapshot?.products.find((p) => p.handle === handle);
  if (!snapshot || !product) return NextResponse.json({ error: 'Product not found in the latest scan' }, { status: 404 });

  const month = new Date().toISOString().slice(0, 7);
  const key = `fix:${store.id}:${month}`;
  if (type !== 'schema' && !(await hit(key, limits.fixesPerMonth, 32 * 86_400))) {
    return NextResponse.json({ error: `You've used this month's ${limits.fixesPerMonth} AI drafts for this store.` }, { status: 429 });
  }

  try {
    const prompts = ((scan!.prompts as unknown as BuyerPrompt[]) || []).map((p) => p.query);
    const after = await draftContentFix(product, type, { brand: snapshot.storeName, currency: snapshot.currency, prompts });
    if (!after) throw new Error('empty draft');
    const fix = await db.contentFix.create({
      data: { storeId: store.id, productHandle: product.handle, productTitle: product.title, type, before: product.description || '', after },
    });
    return NextResponse.json({ fix });
  } catch (e) {
    console.error('content fix failed', e);
    if (type !== 'schema') await refund(key);
    return NextResponse.json({ error: 'Drafting failed. Please try again.' }, { status: 502 });
  }
}
