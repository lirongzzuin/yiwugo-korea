import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../../lib/yiwugo-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { shopId: string } }
) {
  try {
    const { shopId } = params;

    const result = await yiwugo.getShopCategorizeNum(shopId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/shops/[shopId]/categories:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
