'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/cn';
import ProductGrid from '@/components/product/ProductGrid';
import type { Product } from '@/components/product/ProductCard';

function generateImageSearchResults(): Product[] {
  return Array.from({ length: 8 }, (_, i) => {
    const priceKRW = Math.floor(Math.random() * 40000) + 3000;
    return {
      id: `img-result-${i}`,
      name: `이미지 검색 유사상품 ${i + 1}`,
      imageUrl: `https://picsum.photos/seed/imgsearch${i}/400/400`,
      category: ['리빙/주방', '디지털', '패션'][i % 3],
      priceKRW,
      priceCNY: Math.floor(priceKRW / 190),
      moq: [10, 20, 50][i % 3],
      salesCount: Math.floor(Math.random() * 3000),
      badge: i === 0 ? 'TOP' : null,
    };
  });
}

export default function ImageSearchPage() {
  const [preview, setPreview] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<Product[] | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setIsSearching(true);
      // Simulate search
      setTimeout(() => {
        setResults(generateImageSearchResults());
        setIsSearching(false);
      }, 1500);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetSearch = () => {
    setPreview(null);
    setResults(null);
    setIsSearching(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-lg font-heading font-bold text-on-surface mb-1">
        이미지로 검색
      </h1>
      <p className="text-xs text-on-surface-variant mb-6">
        사진을 업로드하면 유사한 상품을 찾아드립니다
      </p>

      {/* Upload Area */}
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-outline-variant/50 bg-surface-container-lowest'
          )}
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] text-primary">
                photo_camera
              </span>
            </div>
            <p className="text-sm font-medium text-on-surface mb-1">
              이미지를 드래그하거나 업로드하세요
            </p>
            <p className="text-xs text-on-surface-variant mb-6">
              JPG, PNG, WEBP (최대 10MB)
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-container text-white rounded-full text-sm font-semibold hover:shadow-medium transition-shadow flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                촬영하기
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-surface-container-high text-on-surface rounded-full text-sm font-semibold hover:bg-surface-container transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">photo_library</span>
                앨범 선택
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      ) : (
        /* Preview */
        <div className="mb-6">
          <div className="relative inline-block w-full max-w-xs mx-auto">
            <img
              src={preview}
              alt="업로드된 이미지"
              className="w-full rounded-xl border border-outline-variant/30"
            />
            <button
              onClick={resetSearch}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          {isSearching && (
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-on-surface-variant">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              유사 상품을 검색 중입니다...
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="mt-6">
          <h2 className="text-base font-heading font-bold text-on-surface mb-3">
            유사 상품 <span className="text-on-surface-variant font-normal">{results.length}개</span>
          </h2>
          <ProductGrid products={results} columns={2} />
        </div>
      )}

      {/* Search Guide */}
      {!preview && (
        <section className="mt-8">
          <h2 className="text-base font-heading font-bold text-on-surface mb-4">
            검색 가이드
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {/* Good example */}
            <div className="p-4 rounded-xl bg-green-50 border border-green-200">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="material-symbols-outlined text-green-600 text-[18px]">
                  check_circle
                </span>
                <span className="text-xs font-semibold text-green-700">좋은 예시</span>
              </div>
              <div className="aspect-square rounded-lg bg-white mb-2 flex items-center justify-center overflow-hidden">
                <img
                  src="https://picsum.photos/seed/good1/200/200"
                  alt="좋은 예시"
                  className="w-full h-full object-cover"
                />
              </div>
              <ul className="space-y-1">
                <li className="text-[11px] text-green-700 flex items-start gap-1">
                  <span className="material-symbols-outlined text-[12px] mt-0.5">check</span>
                  상품이 크게 보이는 사진
                </li>
                <li className="text-[11px] text-green-700 flex items-start gap-1">
                  <span className="material-symbols-outlined text-[12px] mt-0.5">check</span>
                  배경이 깔끔한 사진
                </li>
                <li className="text-[11px] text-green-700 flex items-start gap-1">
                  <span className="material-symbols-outlined text-[12px] mt-0.5">check</span>
                  선명하고 밝은 사진
                </li>
              </ul>
            </div>

            {/* Bad example */}
            <div className="p-4 rounded-xl bg-red-50 border border-red-200">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="material-symbols-outlined text-red-600 text-[18px]">
                  cancel
                </span>
                <span className="text-xs font-semibold text-red-700">나쁜 예시</span>
              </div>
              <div className="aspect-square rounded-lg bg-white mb-2 flex items-center justify-center overflow-hidden">
                <img
                  src="https://picsum.photos/seed/bad1/200/200"
                  alt="나쁜 예시"
                  className="w-full h-full object-cover opacity-50 blur-[1px]"
                />
              </div>
              <ul className="space-y-1">
                <li className="text-[11px] text-red-700 flex items-start gap-1">
                  <span className="material-symbols-outlined text-[12px] mt-0.5">close</span>
                  여러 상품이 섞인 사진
                </li>
                <li className="text-[11px] text-red-700 flex items-start gap-1">
                  <span className="material-symbols-outlined text-[12px] mt-0.5">close</span>
                  흐리거나 어두운 사진
                </li>
                <li className="text-[11px] text-red-700 flex items-start gap-1">
                  <span className="material-symbols-outlined text-[12px] mt-0.5">close</span>
                  텍스트가 많은 이미지
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
