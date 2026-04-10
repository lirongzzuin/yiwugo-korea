import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../lib/yiwugo-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const result = await yiwugo.getMarkets();

    return NextResponse.json({
      markets: result,
    });
  } catch (error) {
    console.error('Error in /api/markets:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
