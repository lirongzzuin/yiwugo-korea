'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

interface TranslationBadgeProps {
  className?: string;
  onToggleOriginal?: () => void;
}

export default function TranslationBadge({ className, onToggleOriginal }: TranslationBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={cn('relative inline-flex', className)}>
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowTooltip(!showTooltip);
        }}
        className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-container text-[10px] text-on-surface-variant hover:bg-surface-container-high transition-colors"
      >
        <span className="material-symbols-outlined text-[12px]">translate</span>
        AI 번역
      </button>
      {showTooltip && (
        <div className="absolute top-full left-0 mt-1.5 w-64 p-3 bg-surface-container-lowest rounded-lg shadow-medium border border-outline-variant/20 z-50">
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            이 상품 정보는 AI가 자동 번역한 것입니다. 원문과 차이가 있을 수 있습니다.
          </p>
          {onToggleOriginal && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleOriginal();
                setShowTooltip(false);
              }}
              className="mt-2 text-[11px] text-primary font-medium flex items-center gap-1 hover:underline"
            >
              <span className="material-symbols-outlined text-[12px]">visibility</span>
              원문 보기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
