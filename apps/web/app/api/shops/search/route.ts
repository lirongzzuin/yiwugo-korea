import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../lib/yiwugo-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const q = searchParams.get('q') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const number = parseInt(searchParams.get('number') || '20', 10);
    const subMarket = searchParams.get('subMarket') || undefined;
    const subFloor = searchParams.get('subFloor') || undefined;

    const result = await yiwugo.searchShops({
      q,
      page,
      number,
      subMarket,
      subFloor,
    });

    return NextResponse.json({
      data: result.shops || [],
      total: result.total || 0,
      page,
    });
  } catch (error) {
    console.error('Error in /api/shops/search:', error);
    return NextResponse.json({ data: [], total: 0, page: 1, error: error instanceof Error ? error.message : 'API unavailable' });
  }
}
