import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../lib/yiwugo-server';
import { mapProduct } from '../../utils';

export const dynamic = 'force-dynamic';

const OVERSEAS_PAYMENT_FEE_RATE = 0.015;

async function getExchangeRate(): Promise<number> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/CNY', { next: { revalidate: 300 } });
    if (res.ok) {
      const json = await res.json();
      if (json.rates?.KRW) {
        const baseRate = Math.round(json.rates.KRW * 100) / 100;
        // 결제 적용 환율 = 기준율 + 해외결제 수수료 1.5%
        return Math.round(baseRate * (1 + OVERSEAS_PAYMENT_FEE_RATE) * 100) / 100;
      }
    }
  } catch { /* fallback */ }
  return Math.round(195 * (1 + OVERSEAS_PAYMENT_FEE_RATE) * 100) / 100;
}

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

    // Map frontend sort keys to Yiwugo API st values
    const sortMap: Record<string, number> = {
      popular: 9,    // sales desc
      priceAsc: 4,   // price asc
      priceDesc: 3,  // price desc
    };

    const rate = await getExchangeRate();

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

    const items = (result.products || []).map((item: any) => mapProduct(item, rate));

    return NextResponse.json({
      data: items,
      total: result.total || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error in /api/products/search:', error);
    return NextResponse.json({ data: [], total: 0, page: 1, pageSize: 20, error: error instanceof Error ? error.message : 'API unavailable' });
  }
}
