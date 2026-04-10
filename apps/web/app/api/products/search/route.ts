import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../lib/yiwugo-server';
import { mapProduct } from '../../utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const sortBy = searchParams.get('sortBy') || '';
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const categoryId = searchParams.get('categoryId') || '';
    const shopId = searchParams.get('shopId') || '';

    // Map frontend params to Yiwugo API params
    const sortMap: Record<string, number> = {
      popular: 9,
      newest: 0,
      priceAsc: 1,
      priceDesc: 2,
    };

    const result = await yiwugo.searchProducts({
      q: q || undefined,
      cpage: page,
      pageSize,
      st: sortMap[sortBy] || undefined,
      stp: minPrice,
      edp: maxPrice,
      productLable: categoryId || undefined,
      shopId: shopId || undefined,
    });

    const items = (result.products || []).map((item: any) => mapProduct(item, 180));

    return NextResponse.json({
      data: items,
      total: result.total || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error in /api/products/search:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
