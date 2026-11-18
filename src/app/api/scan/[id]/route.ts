import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scan = db.getScanById(id);

  if (!scan) {
    return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, scan });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 });
    }

    const updated = db.updateScan(id, {
      email: email.trim(),
      unlocked: true
    });

    if (!updated) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Full report unlocked! We have queued a copy to your email.',
      scan: updated
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to unlock scan' }, { status: 500 });
  }
}
