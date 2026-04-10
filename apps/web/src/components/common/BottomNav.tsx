'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

interface NavItem {
  icon: string;
  filledIcon: string;
  label: string;
  href: string;
  match: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    icon: 'home',
    filledIcon: 'home',
    label: '홈',
    href: '/',
    match: (p) => p === '/',
  },
  {
    icon: 'category',
    filledIcon: 'category',
    label: '카테고리',
    href: '/category',
    match: (p) => p.startsWith('/category'),
  },
  {
    icon: 'search',
    filledIcon: 'search',
    label: '검색',
    href: '/search',
    match: (p) => p.startsWith('/search'),
  },
  {
    icon: 'shopping_cart',
    filledIcon: 'shopping_cart',
    label: '장바구니',
    href: '/cart',
    match: (p) => p.startsWith('/cart'),
  },
  {
    icon: 'person',
    filledIcon: 'person',
    label: '마이',
    href: '/profile',
    match: (p) => p.startsWith('/profile'),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-lg border-t border-outline-variant/40 rounded-t-2xl shadow-strong">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-all duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200',
                  isActive && 'bg-primary/10'
                )}
              >
                <span
                  className={cn(
                    'material-symbols-outlined text-[22px]',
                    isActive && 'filled'
                  )}
                >
                  {isActive ? item.filledIcon : item.icon}
                </span>
              </div>
              <span
                className={cn(
                  'text-[10px] leading-tight',
                  isActive ? 'font-semibold' : 'font-medium'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-safe-bottom" />
    </nav>
  );
}
