'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';

interface SearchBarProps {
  autoFocus?: boolean;
  className?: string;
}

export default function SearchBar({ autoFocus = false, className }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative w-full', className)}>
      <div
        className={cn(
          'flex items-center w-full rounded-full border transition-all duration-200',
          isFocused
            ? 'border-primary bg-white shadow-soft ring-2 ring-primary/10'
            : 'border-outline-variant bg-surface-container hover:border-outline'
        )}
      >
        <button
          type="submit"
          className="pl-4 pr-2 py-2.5 shrink-0"
          aria-label="검색"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
            search
          </span>
        </button>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="이우 시장의 200만개 상품 검색"
          className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none py-2.5 pr-2"
        />
        <button
          type="button"
          className="pr-4 pl-2 py-2.5 shrink-0"
          aria-label="카메라 검색"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
            photo_camera
          </span>
        </button>
      </div>
    </form>
  );
}
