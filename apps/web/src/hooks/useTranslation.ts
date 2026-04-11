'use client';

import { useState, useEffect, useRef } from 'react';

// Global client-side translation cache (persists across component lifecycles)
const clientCache = new Map<string, string>();

/**
 * Check if text contains Chinese characters
 */
function hasChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

/**
 * Hook to translate an array of product objects.
 * Returns products with translated `name` field.
 * Shows original text immediately, then swaps to Korean when translation completes.
 */
export function useTranslatedProducts<T extends { name: string }>(products: T[]): T[] {
  const [translated, setTranslated] = useState<T[]>(products);
  const lastKey = useRef('');

  useEffect(() => {
    if (!products || products.length === 0) {
      return; // Don't reset to empty — keep previous state
    }

    // Create a stable key to avoid duplicate requests
    const key = products.map((p) => p.name).join('|').substring(0, 200);
    if (key === lastKey.current) return;
    lastKey.current = key;

    // First, apply cached translations immediately (synchronous)
    const withCache = products.map((p) => {
      if (clientCache.has(p.name)) {
        return { ...p, name: clientCache.get(p.name)! };
      }
      return p;
    });
    setTranslated(withCache);

    // Find texts that need translation (have Chinese and not cached)
    const needsTranslation = products
      .map((p) => p.name)
      .filter((name) => hasChinese(name) && !clientCache.has(name));

    if (needsTranslation.length === 0) return;

    // Deduplicate
    const uniqueTexts = [...new Set(needsTranslation)];

    // Batch translate via API
    fetch('/api/translate/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: uniqueTexts }),
    })
      .then((res) => res.json())
      .then((data) => {
        const translations: string[] = data.translations || [];

        // Update cache
        uniqueTexts.forEach((text, i) => {
          if (translations[i]) {
            clientCache.set(text, translations[i]);
          }
        });

        // Apply translations to products
        setTranslated(
          products.map((p) => ({
            ...p,
            name: clientCache.get(p.name) || p.name,
          }))
        );
      })
      .catch(() => {
        // On error, keep original text
      });
  }, [products]);

  return translated;
}

/**
 * Hook to translate a single text string.
 * Returns translated text (or original while loading).
 */
export function useTranslatedText(text: string): string {
  const [result, setResult] = useState(text);

  useEffect(() => {
    if (!text || !hasChinese(text)) {
      setResult(text);
      return;
    }

    if (clientCache.has(text)) {
      setResult(clientCache.get(text)!);
      return;
    }

    fetch('/api/translate/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: [text] }),
    })
      .then((res) => res.json())
      .then((data) => {
        const translated = data.translations?.[0];
        if (translated) {
          clientCache.set(text, translated);
          setResult(translated);
        }
      })
      .catch(() => {});
  }, [text]);

  return result;
}
