'use client';

import { useState, useEffect, useRef } from 'react';

const clientCache = new Map<string, string>();

function hasChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

/**
 * Hook to translate product names from Chinese to Korean.
 * Shows original immediately, then updates to Korean asynchronously.
 */
export function useTranslatedProducts<T extends { name: string }>(products: T[]): T[] {
  const [translated, setTranslated] = useState<T[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const productsRef = useRef(products);

  useEffect(() => {
    productsRef.current = products;

    if (!products || products.length === 0) {
      setTranslated([]);
      return;
    }

    // Apply cached translations synchronously first, show original for uncached
    const initial = products.map((p) => ({
      ...p,
      name: clientCache.get(p.name) || p.name,
    }));
    setTranslated(initial);

    // Find texts that need translation
    const needsTranslation = [...new Set(
      products.map((p) => p.name).filter((n) => hasChinese(n) && !clientCache.has(n))
    )];

    if (needsTranslation.length === 0) return;

    // Abort previous request
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
        // Only update if products haven't changed
        if (productsRef.current === products) {
          setTranslated(
            products.map((p) => ({ ...p, name: clientCache.get(p.name) || p.name }))
          );
        }
      })
      .catch(() => {}); // Silently ignore abort errors

    return () => { controller.abort(); };
  }, [products]);

  return translated.length > 0 ? translated : products;
}

/**
 * Hook to translate a single text string.
 */
export function useTranslatedText(text: string): string {
  const [result, setResult] = useState(() => clientCache.get(text) || text);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!text) { setResult(''); return; }

    // Check cache first
    if (clientCache.has(text)) {
      setResult(clientCache.get(text)!);
      return;
    }

    if (!hasChinese(text)) {
      setResult(text);
      return;
    }

    // Show original immediately
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
