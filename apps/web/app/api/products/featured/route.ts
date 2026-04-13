import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../lib/yiwugo-server';
import { mapProductsAsync } from '../../utils';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

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

export async function GET(_request: NextRequest) {
  try {
    // Fetch popular/hot products as "featured" — productLable=1 means 热卖 (hot)
    const [result, rate] = await Promise.all([
      yiwugo.searchProducts({
        productLable: '1',
        cpage: 1,
        pageSize: 12,
      }),
      getExchangeRate(),
    ]);

    // 서버사이드 완전 번역
    const items = await mapProductsAsync(result.products || [], rate);

    return NextResponse.json({
      data: items,
      total: result.total || 0,
    });
  } catch (error) {
    console.error('Error in /api/products/featured:', error);
    return NextResponse.json({ data: [], total: 0, error: error instanceof Error ? error.message : 'API unavailable' });
  }
}
