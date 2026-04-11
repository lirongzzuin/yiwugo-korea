'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        'fixed bottom-20 md:bottom-8 right-4 z-30 w-11 h-11 rounded-full bg-white shadow-strong border border-outline-variant/30 flex items-center justify-center transition-all duration-300',
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      )}
      aria-label="맨 위로 스크롤"
    >
      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">arrow_upward</span>
    </button>
  );
}
