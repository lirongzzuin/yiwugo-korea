import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../lib/yiwugo-server';
import { mapProduct, translateProducts } from '../../utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const pageSize = parseInt(request.nextUrl.searchParams.get('pageSize') || '20', 10);

    // st=9 means sort by sales count (판매량순)
    const result = await yiwugo.searchProducts({
      st: 9,
      cpage: 1,
      pageSize,
    });

    const items = (result.products || []).map((item: any) => mapProduct(item));
    const translatedItems = await translateProducts(items);

    return NextResponse.json({
      data: translatedItems,
      total: result.total || 0,
    });
  } catch (error) {
    console.error('Error in /api/products/popular:', error);
    return NextResponse.json({ data: [], total: 0, error: error instanceof Error ? error.message : 'API unavailable' });
  }
}
