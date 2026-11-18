import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('store_id') || undefined;
  const products = db.getProducts(storeId);
  return NextResponse.json({ success: true, products });
}
