import { NextRequest, NextResponse } from 'next/server';
import { translateText } from '../../../lib/translation-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/translate?text=...
 * 단일 텍스트 번역 - 통합 번역 서비스 사용
 */
export async function GET(request: NextRequest) {
  try {
    const text = request.nextUrl.searchParams.get('text') || '';
    if (!text.trim()) {
      return NextResponse.json({ translated: '', original: '' });
    }

    const translated = await translateText(text);
    return NextResponse.json({ translated, original: text });
  } catch (error) {
    const text = request.nextUrl.searchParams.get('text') || '';
    return NextResponse.json({ translated: text, original: text, error: 'Translation failed' });
  }
}
