import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../lib/yiwugo-server';
import { mapProductsAsync } from '../../utils';

export const dynamic = 'force-dynamic';

async function getExchangeRate(): Promise<number> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/CNY', { next: { revalidate: 300 } });
    if (res.ok) {
      const json = await res.json();
      if (json.rates?.KRW) {
        const baseRate = Math.round(json.rates.KRW * 100) / 100;
        return Math.round(baseRate * 1.015 * 100) / 100;
      }
    }
  } catch { /* fallback */ }
  return 198;
}

export async function GET(request: NextRequest) {
  try {
    const pageSize = parseInt(request.nextUrl.searchParams.get('pageSize') || '20', 10);
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1', 10);

    const rate = await getExchangeRate();

    // st=9 means sort by sales count (판매량순)
    const result = await yiwugo.searchProducts({
      st: 9,
      cpage: page,
      pageSize,
    });

    const items = await mapProductsAsync(result.products || [], rate);

    return NextResponse.json({
      data: items,
      total: result.total || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error in /api/products/popular:', error);
    return NextResponse.json({ data: [], total: 0, page: 1, pageSize: 20, error: error instanceof Error ? error.message : 'API unavailable' });
  }
}
