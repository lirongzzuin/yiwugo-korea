import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const rate = 180;
    const currency = 'KRW';
    const base = 'CNY';
    const updatedAt = new Date().toISOString();

    return NextResponse.json({
      rate,
      currency,
      base,
      updatedAt,
    });
  } catch (error) {
    console.error('Error in /api/exchange-rate/current:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
