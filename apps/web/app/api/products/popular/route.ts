import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../lib/yiwugo-server';
import { mapProduct } from '../../utils';

export async function GET(request: NextRequest) {
  try {
    const pageSize = parseInt(request.nextUrl.searchParams.get('pageSize') || '20', 10);

    const result = await yiwugo.searchProducts({
      st: 9,
      cpage: 1,
      pageSize,
    });

    const items = (result.products || []).map((item: any) => mapProduct(item, 180));

    return NextResponse.json({
      data: items,
      total: result.total || 0,
    });
  } catch (error) {
    console.error('Error in /api/products/popular:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
