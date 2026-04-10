'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart-store';
import SearchBar from './SearchBar';
import MobileHeader from './MobileHeader';

export default function Header() {
  const cartTotal = useCartStore((s) => s.totalItems());
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/40">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-6">
            {/* Left: Menu + Logo */}
            <div className="flex items-center gap-4 shrink-0">
              <button
                className="p-2 rounded-full hover:bg-surface-container transition-colors"
                aria-label="메뉴"
              >
                <span className="material-symbols-outlined text-on-surface">
                  menu
                </span>
              </button>
              <Link href="/" className="flex items-center gap-1">
                <span className="text-xl font-heading font-black text-primary tracking-tight">
                  YiwuGo
                </span>
                <span className="text-xl font-heading font-black text-on-surface tracking-tight">
                  Korea
                </span>
              </Link>
            </div>

            {/* Center: Search bar */}
            <div className="flex-1 max-w-2xl">
              <SearchBar />
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href="/notifications"
                className="p-2 rounded-full hover:bg-surface-container transition-colors relative"
                aria-label="알림"
              >
                <span className="material-symbols-outlined text-on-surface">
                  notifications
                </span>
              </Link>
              <Link
                href="/cart"
                className="p-2 rounded-full hover:bg-surface-container transition-colors relative"
                aria-label="장바구니"
              >
                <span className="material-symbols-outlined text-on-surface">
                  shopping_cart
                </span>
                {mounted && cartTotal > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold px-1">
                    {cartTotal > 99 ? '99+' : cartTotal}
                  </span>
                )}
              </Link>
              <Link
                href="/profile"
                className="p-2 rounded-full hover:bg-surface-container transition-colors"
                aria-label="프로필"
              >
                <span className="material-symbols-outlined text-on-surface">
                  person
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <MobileHeader />
    </>
  );
}
