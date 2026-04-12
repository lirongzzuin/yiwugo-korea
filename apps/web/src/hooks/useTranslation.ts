'use client';

import { useState, useEffect, useRef } from 'react';

const clientCache = new Map<string, string>();

function hasChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

/**
 * 상품 이름 배열 번역 훅
 *
 * 성능 최적화:
 * - 서버사이드에서 mapProduct가 이미 용어사전 기반 번역을 적용함
 * - 여전히 중국어가 있는 경우만 추가 API 호출 (대부분 건너뜀)
 * - 중국어가 없으면 원본 배열 그대로 반환 (useState 호출 X → 렌더 감소)
 */
export function useTranslatedProducts<T extends { name: string }>(products: T[]): T[] {
  const [translated, setTranslated] = useState<T[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const productsRef = useRef(products);

  // 중국어가 남아있는 상품이 있는지 먼저 체크
  const hasAnyChinese = products.some((p) => hasChinese(p.name));

  useEffect(() => {
    productsRef.current = products;

    if (!products || products.length === 0) {
      setTranslated([]);
      return;
    }

    // 중국어가 없으면 번역 불필요 - 즉시 종료
    if (!hasAnyChinese) return;

    // 캐시 적용
    const initial = products.map((p) => ({
      ...p,
      name: clientCache.get(p.name) || p.name,
    }));
    setTranslated(initial);

    // 번역 필요한 텍스트 수집
    const needsTranslation = [...new Set(
      products.map((p) => p.name).filter((n) => hasChinese(n) && !clientCache.has(n))
    )];

    if (needsTranslation.length === 0) return;

    // 이전 요청 취소
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    fetch('/api/translate/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: needsTranslation }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (controller.signal.aborted) return;
        const translations: string[] = data.translations || [];
        needsTranslation.forEach((text, i) => {
          if (translations[i]) clientCache.set(text, translations[i]);
        });
        if (productsRef.current === products) {
          setTranslated(
            products.map((p) => ({ ...p, name: clientCache.get(p.name) || p.name }))
          );
        }
      })
      .catch(() => {});

    return () => { controller.abort(); };
  }, [products, hasAnyChinese]);

  // 중국어 없거나 번역 결과가 없으면 원본 반환
  return !hasAnyChinese || translated.length === 0 ? products : translated;
}

/**
 * 단일 텍스트 번역 훅
 */
export function useTranslatedText(text: string): string {
  const [result, setResult] = useState(() => clientCache.get(text) || text);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!text) { setResult(''); return; }

    if (clientCache.has(text)) {
      setResult(clientCache.get(text)!);
      return;
    }

    if (!hasChinese(text)) {
      setResult(text);
      return;
    }

    setResult(text);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    fetch('/api/translate/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: [text] }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (controller.signal.aborted) return;
        const translated = data.translations?.[0];
        if (translated) {
          clientCache.set(text, translated);
          setResult(translated);
        }
      })
      .catch(() => {});

    return () => { controller.abort(); };
  }, [text]);

  return result;
}
