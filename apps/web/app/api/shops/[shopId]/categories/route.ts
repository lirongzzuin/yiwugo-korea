import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../../lib/yiwugo-server';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const shopId = params.shopId;
    const result = await yiwugo.getShopCategorizeNum(shopId);

    const categories = (result?.typeProducts || []).map((item: any) => ({
      categoryId: String(item.defineType),
      productCount: item.productNums || 0,
    }));

    return NextResponse.json({
      shopId,
      categories,
    });
  } catch (error) {
    console.error('Error in /api/shops/[shopId]/categories:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
