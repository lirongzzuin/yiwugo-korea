'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

interface TranslationToggleProps {
  originalText: string;
  translatedText: string;
  originalLang?: string;
  className?: string;
  textClassName?: string;
}

export default function TranslationToggle({
  originalText,
  translatedText,
  originalLang = '中文',
  className,
  textClassName,
}: TranslationToggleProps) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <div className={className}>
      <div className="mb-1">
        <span className={cn('text-on-surface', textClassName)}>
          {showOriginal ? originalText : translatedText}
        </span>
      </div>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowOriginal(!showOriginal);
        }}
        className="flex items-center gap-1 text-[11px] text-on-surface-variant/60 hover:text-primary/70 transition-colors"
      >
        <span className="material-symbols-outlined text-[14px]">translate</span>
        {showOriginal ? '한국어로 보기' : `${originalLang} 원문 보기`}
      </button>
    </div>
  );
}
