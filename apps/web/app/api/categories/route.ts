import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../lib/yiwugo-server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const upperType = searchParams.get('upperType') || undefined;

    const result = await yiwugo.getCategories(upperType);

    // Return as array directly — the category page checks Array.isArray(data)
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/categories:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
