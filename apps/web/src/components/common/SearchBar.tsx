'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/cn';

interface SearchBarProps {
  autoFocus?: boolean;
  className?: string;
}

interface Suggestion {
  id: string;
  name: string;
  priceKRW: number;
  imageUrl?: string;
  category?: string;
}

const POPULAR_KEYWORDS = ['LED', 'USB', '이어폰', '케이스', '수납', '완구', '주방', '공구'];

export default function SearchBar({ autoFocus = false, className }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 디바운스 검색
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 1) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}&pageSize=5`);
      const data = await res.json();
      if (data?.data) {
        setSuggestions(data.data.slice(0, 5));
      }
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(value.trim()), 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      setIsFocused(false);
      setSuggestions([]);
      inputRef.current?.blur();
    }
  };

  const handleSelectSuggestion = (item: Suggestion) => {
    setIsFocused(false);
    setSuggestions([]);
    router.push(`/product/${item.id}`);
  };

  const handleKeywordClick = (kw: string) => {
    setQuery(kw);
    setIsFocused(false);
    setSuggestions([]);
    router.push(`/search?q=${encodeURIComponent(kw)}`);
  };

  const showDropdown = isFocused && (query.length > 0 ? suggestions.length > 0 || isSearching : true);

  return (
    <div ref={wrapperRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            'flex items-center w-full rounded-full border transition-all duration-200',
            isFocused
              ? 'border-primary bg-white shadow-soft ring-2 ring-primary/10'
              : 'border-outline-variant bg-surface-container hover:border-outline'
          )}
        >
          <button type="submit" className="pl-4 pr-2 py-2.5 shrink-0" aria-label="검색">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
          </button>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="이우 시장의 200만개 상품 검색"
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none py-2.5 pr-2"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }}
              className="pr-2 py-2.5 shrink-0"
              aria-label="검색어 지우기"
            >
              <span className="material-symbols-outlined text-on-surface-variant/50 text-[18px]">close</span>
            </button>
          )}
          <button
            type="button"
            className="pr-4 pl-1 py-2.5 shrink-0"
            aria-label="카메라 검색"
            onClick={() => router.push('/image-search')}
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">photo_camera</span>
          </button>
        </div>
      </form>

      {/* Autocomplete dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-strong border border-outline-variant/20 z-50 overflow-hidden">
          {query.length === 0 ? (
            // 인기 검색어
            <div className="p-4">
              <p className="text-xs font-semibold text-on-surface-variant mb-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                인기 검색어
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_KEYWORDS.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => handleKeywordClick(kw)}
                    className="px-3 py-1.5 rounded-full bg-surface-container text-xs font-medium text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          ) : isSearching ? (
            <div className="flex items-center justify-center py-6 gap-2">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-xs text-on-surface-variant">검색 중...</span>
            </div>
          ) : (
            // 검색 결과 추천
            <div>
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item)}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-surface-container-low transition-colors text-left"
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 bg-surface-container" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-surface-container shrink-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant/30">image</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-on-surface line-clamp-1">{item.name}</p>
                    <p className="text-xs text-primary font-semibold">{item.priceKRW.toLocaleString()}원</p>
                  </div>
                  {item.category && (
                    <span className="text-[10px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded shrink-0">{item.category}</span>
                  )}
                </button>
              ))}
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => setIsFocused(false)}
                className="flex items-center justify-center gap-1 py-3 text-xs text-primary font-medium hover:bg-surface-container-low transition-colors border-t border-outline-variant/20"
              >
                &lsquo;{query}&rsquo; 전체 검색 결과 보기
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
