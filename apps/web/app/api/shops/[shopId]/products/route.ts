import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../../lib/yiwugo-server';
import { mapProduct } from '../../../utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const shopId = params.shopId;
    const searchParams = request.nextUrl.searchParams;

    const keyword = searchParams.get('keyword') || undefined;
    const productLable = searchParams.get('productLable') || undefined;
    const st = searchParams.get('st') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);

    const result = await yiwugo.searchShopProducts({
      shopId,
      keyword,
      productLable,
      st,
      cpage: page,
      pagesize: pageSize,
    });

    const products = (result.products || []).map((item: any) => mapProduct(item, 180));

    return NextResponse.json({
      shopName: result.shopName || '',
      pageSize: result.pageSize || pageSize,
      products,
    });
  } catch (error) {
    console.error('Error in /api/shops/[shopId]/products:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
