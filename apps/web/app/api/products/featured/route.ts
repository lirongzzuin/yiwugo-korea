import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../lib/yiwugo-server';
import { mapProduct, translateProducts } from '../../utils';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    // Fetch popular/hot products as "featured" — productLable=1 means 热卖 (hot)
    const result = await yiwugo.searchProducts({
      productLable: '1',
      cpage: 1,
      pageSize: 12,
    });

    const items = (result.products || []).map((item: any) => mapProduct(item));
    const translatedItems = await translateProducts(items);

    return NextResponse.json({
      data: translatedItems,
      total: result.total || 0,
    });
  } catch (error) {
    console.error('Error in /api/products/featured:', error);
    return NextResponse.json({ data: [], total: 0, error: error instanceof Error ? error.message : 'API unavailable' });
  }
}
