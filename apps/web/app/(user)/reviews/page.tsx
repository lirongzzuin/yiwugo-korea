'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';

const STAR_EMOJI = ['😞', '😐', '🙂', '😊', '🤩'];
const STAR_LABEL = ['별로예요', '그저 그래요', '괜찮아요', '좋아요', '최고예요!'];

const MOCK_PRODUCT = {
  name: '실리콘 주방용품 세트 논슬립 조리도구 5종',
  variant: '색상: 그레이 / 수량: 20개',
  imageUrl: 'https://picsum.photos/seed/review-product/200/200',
};

export default function ReviewWritePage() {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newPhotos: string[] = [];
    Array.from(files).forEach((file) => {
      if (photos.length + newPhotos.length >= 5) return;
      newPhotos.push(URL.createObjectURL(file));
    });
    setPhotos((prev) => [...prev, ...newPhotos].slice(0, 5));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const canSubmit = rating > 0 && content.trim().length >= 10;

  return (
    <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto pb-8">
      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-outline-variant/20">
        <h1 className="font-heading font-bold text-lg text-on-surface">리뷰 작성</h1>
      </div>

      {/* Product Context Card */}
      <section className="bg-white mt-2 px-5 py-4">
        <div className="flex gap-3">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
            <Image
              src={MOCK_PRODUCT.imageUrl}
              alt={MOCK_PRODUCT.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-on-surface line-clamp-2">{MOCK_PRODUCT.name}</p>
            <p className="text-xs text-on-surface-variant mt-1">{MOCK_PRODUCT.variant}</p>
          </div>
        </div>
      </section>

      {/* Star Rating */}
      <section className="bg-white mt-2 px-5 py-6">
        <h2 className="font-heading font-bold text-base text-on-surface text-center mb-4">
          상품은 어떠셨나요?
        </h2>
        <div className="flex justify-center gap-2 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <span
                className={cn(
                  'material-symbols-outlined text-[36px] transition-colors',
                  star <= rating ? 'text-amber-400' : 'text-stone-200'
                )}
                style={star <= rating ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                star
              </span>
            </button>
          ))}
        </div>
        {rating > 0 && (
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">{STAR_EMOJI[rating - 1]}</span>
            <span className="text-sm font-semibold text-on-surface">{STAR_LABEL[rating - 1]}</span>
          </div>
        )}
      </section>

      {/* Photo Upload */}
      <section className="bg-white mt-2 px-5 py-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-base text-on-surface">사진 첨부</h2>
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold">
              +500 Points
            </span>
          </div>
          <span className="text-xs text-on-surface-variant">{photos.length}/5</span>
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {/* Add button */}
          {photos.length < 5 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-outline-variant/40 flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-colors flex-shrink-0"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[24px]">
                add_a_photo
              </span>
              <span className="text-[10px] text-on-surface-variant">추가</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoUpload}
          />

          {/* Photo previews */}
          {photos.map((photo, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={photo}
                alt={`리뷰 사진 ${i + 1}`}
                fill
                className="object-cover"
              />
              <button
                onClick={() => removePhoto(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-white text-[14px]">close</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Detailed Review */}
      <section className="bg-white mt-2 px-5 py-5">
        <h2 className="font-heading font-bold text-base text-on-surface mb-3">상세 리뷰</h2>
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 1000))}
            placeholder="상품에 대한 솔직한 리뷰를 남겨주세요. (최소 10자 이상)"
            rows={6}
            className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
          />
          <span className="absolute bottom-3 right-3 text-xs text-on-surface-variant">
            {content.length}/1,000
          </span>
        </div>
      </section>

      {/* Submit */}
      <div className="px-5 mt-4">
        <button
          disabled={!canSubmit}
          className={cn(
            'w-full py-3.5 rounded-2xl font-bold text-base transition-all',
            canSubmit
              ? 'bg-gradient-to-r from-primary to-primary-container text-white shadow-medium hover:shadow-strong active:scale-[0.98]'
              : 'bg-surface-container text-on-surface-variant/40 cursor-not-allowed'
          )}
        >
          리뷰 등록하기
        </button>
      </div>

      {/* Policy link */}
      <div className="text-center mt-3 px-5">
        <Link
          href="#"
          className="text-xs text-on-surface-variant/60 underline hover:text-on-surface-variant"
        >
          리뷰 작성 정책 보기
        </Link>
      </div>
    </div>
  );
}
