'use client';

import Link from 'next/link';
import { useUIStore } from '@/stores/ui-store';
import SearchBar from './SearchBar';

export default function MobileHeader() {
  const { isMobileMenuOpen, setMobileMenuOpen, isSearchOpen, setSearchOpen } =
    useUIStore();

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-lg border-b border-outline-variant/40">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left: Hamburger */}
          <button
            className="p-1.5 -ml-1.5 rounded-full hover:bg-surface-container transition-colors"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="메뉴"
          >
            <span className="material-symbols-outlined text-on-surface text-[22px]">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          {/* Center: Logo */}
          <Link href="/" className="flex items-center gap-0.5">
            <span className="text-lg font-heading font-black text-primary tracking-tight">
              YiwuGo
            </span>
            <span className="text-lg font-heading font-black text-on-surface tracking-tight">
              Korea
            </span>
          </Link>

          {/* Right: Search + Cart */}
          <div className="flex items-center gap-0.5">
            <button
              className="p-1.5 rounded-full hover:bg-surface-container transition-colors"
              onClick={() => setSearchOpen(true)}
              aria-label="검색"
            >
              <span className="material-symbols-outlined text-on-surface text-[22px]">
                search
              </span>
            </button>
            <Link
              href="/cart"
              className="p-1.5 -mr-1.5 rounded-full hover:bg-surface-container transition-colors relative"
              aria-label="장바구니"
            >
              <span className="material-symbols-outlined text-on-surface text-[22px]">
                shopping_cart
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="absolute inset-x-0 top-0 bg-surface z-50 animate-fade-in">
            <div className="flex items-center h-14 px-4 gap-3">
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1.5 shrink-0 rounded-full hover:bg-surface-container"
                aria-label="닫기"
              >
                <span className="material-symbols-outlined text-on-surface text-[22px]">
                  arrow_back
                </span>
              </button>
              <div className="flex-1">
                <SearchBar autoFocus />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/40 animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="md:hidden fixed top-14 left-0 bottom-0 w-72 z-50 bg-surface shadow-strong animate-slide-down overflow-y-auto">
            <div className="py-4">
              <div className="px-4 pb-3 mb-3 border-b border-outline-variant/40">
                <Link
                  href="/login"
                  className="flex items-center gap-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="material-symbols-outlined text-primary text-[28px]">
                    account_circle
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      로그인 / 회원가입
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      도매가로 구매하세요
                    </p>
                  </div>
                </Link>
              </div>

              {[
                { icon: 'home', label: '홈', href: '/' },
                { icon: 'category', label: '카테고리', href: '/category' },
                { icon: 'local_fire_department', label: '인기 상품', href: '/hot' },
                { icon: 'new_releases', label: '신상품', href: '/new' },
                { icon: 'percent', label: '특가', href: '/deals' },
                { icon: 'inventory_2', label: '주문 내역', href: '/orders' },
                { icon: 'favorite', label: '찜 목록', href: '/wishlist' },
                { icon: 'help', label: '고객센터', href: '/help' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium text-on-surface">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
