import { NextRequest, NextResponse } from 'next/server';
import { translateBatch } from '../../../../lib/translation-service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/translate/batch
 * Body: { texts: string[] }
 * Response: { translations: string[] }
 *
 * 통합 번역 서비스를 사용하여 배치 번역.
 * - 메모리 + 파일 캐시 히트 시 즉시 응답
 * - 캐시 미스 시 용어사전 적용 + MyMemory API (3초 타임아웃)
 * - API 실패 시 용어사전 폴백으로 자동 복구
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const texts = Array.isArray(body?.texts) ? body.texts : [];

    if (texts.length === 0) {
      return NextResponse.json({ translations: [] });
    }

    const translations = await translateBatch(texts);
    return NextResponse.json({ translations });
  } catch (error) {
    console.error('Error in /api/translate/batch:', error);
    // 에러여도 200 반환 (UI가 원문을 그대로 사용하도록)
    return NextResponse.json({ translations: [] });
  }
}
