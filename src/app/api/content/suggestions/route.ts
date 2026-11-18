import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('store_id') || undefined;
  const suggestions = db.getContentSuggestions(storeId);
  return NextResponse.json({ success: true, suggestions });
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, after_content } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Suggestion ID and status are required' }, { status: 400 });
    }

    const updates: any = { status };
    if (after_content !== undefined) {
      updates.after_content = after_content;
    }

    const updated = db.updateContentSuggestion(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
    }

    // If synced, update the product description in database
    if (status === 'synced' && updated.product_id) {
      const prod = db.getProductById(updated.product_id);
      if (prod) {
        db.updateProduct(prod.id, {
          description: updated.after_content,
          content_gap_score: Math.max(10, prod.content_gap_score - 35)
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: status === 'synced'
        ? 'Content approved and synced back to Shopify product catalog!'
        : `Suggestion marked as ${status}`,
      suggestion: updated
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Update failed' }, { status: 500 });
  }
}
