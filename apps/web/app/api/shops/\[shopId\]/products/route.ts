import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../../lib/yiwugo-server';
import { mapProduct } from '../../../utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;
    const searchParams = request.nextUrl.searchParams;

    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
    const sortBy = searchParams.get('sortBy') || '';

    const result = await yiwugo.searchShopProducts({
      shopId,
      keyword: q,
      page,
      pageSize,
      sortBy,
    });

    const items = (result.items || []).map((item) => mapProduct(item, 180));

    return NextResponse.json({
      items,
      total: result.total || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error in /api/shops/[shopId]/products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
