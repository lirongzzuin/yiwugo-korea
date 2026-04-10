import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    // Try to fetch real exchange rate from free API
    let rate = 190.5; // fallback
    let source = 'fallback';

    try {
      const res = await fetch('https://open.er-api.com/v6/latest/CNY', {
        next: { revalidate: 300 } // cache 5 minutes
      });
      if (res.ok) {
        const json = await res.json();
        if (json.rates?.KRW) {
          rate = Math.round(json.rates.KRW * 100) / 100;
          source = 'open.er-api.com';
        }
      }
    } catch {
      // use fallback
    }

    return NextResponse.json({
      rate,
      currency: 'KRW',
      base: 'CNY',
      source,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in /api/exchange-rate/current:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
