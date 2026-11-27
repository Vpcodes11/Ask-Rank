import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { activeEngines } from '@/lib/engines';
import { llmProvider } from '@/lib/llm';

export const dynamic = 'force-dynamic';

/**
 * Launch checklist for the running deployment.
 *   GET /api/health                         -> { ok, database }   (public, for uptime monitors)
 *   GET /api/health?key=<CRON_SECRET>       -> every setting, present / missing (never the values)
 */
export async function GET(req: NextRequest) {
  let database = false;
  try {
    await db.$queryRaw`SELECT 1`;
    database = true;
  } catch (e) {
    console.error('health: database', e);
  }

  const key = new URL(req.url).searchParams.get('key');
  const secret = process.env.CRON_SECRET;
  if (!secret || key !== secret) {
    return NextResponse.json({ ok: database, database }, { status: database ? 200 : 503, headers: { 'Cache-Control': 'no-store' } });
  }

  const has = (n: string) => Boolean(process.env[n]);
  const appUrl = process.env.APP_URL || '';
  const checks: Record<string, { ok: boolean; note?: string }> = {
    database: { ok: database },
    APP_URL: { ok: appUrl.startsWith('https://'), note: appUrl ? undefined : 'Set to your live https:// address' },
    AUTH_SECRET: { ok: (process.env.AUTH_SECRET || '').length >= 32, note: 'At least 32 characters (openssl rand -hex 32)' },
    ai_engines: { ok: activeEngines().length > 0, note: `Active: ${activeEngines().map((e) => e.id).join(', ') || 'none'}` },
    ai_text_model: { ok: Boolean(llmProvider()), note: 'OPENAI_API_KEY or GEMINI_API_KEY, used to write prompts and read answers' },
    RESEND_API_KEY: { ok: has('RESEND_API_KEY') },
    EMAIL_FROM: { ok: has('EMAIL_FROM'), note: 'Must use a domain verified in Resend' },
    DODO_PAYMENTS_API_KEY: { ok: has('DODO_PAYMENTS_API_KEY') },
    DODO_PAYMENTS_WEBHOOK_KEY: { ok: has('DODO_PAYMENTS_WEBHOOK_KEY') },
    DODO_PAYMENTS_ENVIRONMENT: { ok: true, note: process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode' ? 'LIVE' : 'test mode' },
    DODO_PRODUCT_REPORT_USD: { ok: has('DODO_PRODUCT_REPORT_USD') },
    DODO_PRODUCT_MONITOR_USD: { ok: has('DODO_PRODUCT_MONITOR_USD') },
    DODO_PRODUCT_AGENCY_USD: { ok: has('DODO_PRODUCT_AGENCY_USD') },
    CRON_SECRET: { ok: true },
    NEXT_PUBLIC_SUPPORT_EMAIL: { ok: has('NEXT_PUBLIC_SUPPORT_EMAIL') },
  };
  const ready = Object.values(checks).every((c) => c.ok);
  return NextResponse.json({ ready, checks }, { headers: { 'Cache-Control': 'no-store' } });
}
