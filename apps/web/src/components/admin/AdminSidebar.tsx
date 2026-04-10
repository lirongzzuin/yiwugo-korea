'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

interface NavItem {
  icon: string;
  label: string;
  href: string;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    items: [{ icon: 'dashboard', label: '홈', href: '/admin' }],
  },
  {
    title: '운영',
    items: [
      { icon: 'shopping_cart', label: '주문 관리', href: '/admin/orders' },
      { icon: 'inventory_2', label: '상품 관리', href: '/admin/products' },
      { icon: 'group', label: '회원 관리', href: '/admin/users' },
    ],
  },
  {
    title: '재무',
    items: [
      { icon: 'account_balance', label: '정산 관리', href: '/admin/settlements' },
      { icon: 'currency_exchange', label: '환율 관리', href: '/admin/exchange-rate' },
      { icon: 'translate', label: '번역 관리', href: '/admin/translations' },
    ],
  },
  {
    title: '콘텐츠',
    items: [
      { icon: 'confirmation_number', label: '쿠폰 관리', href: '/admin/coupons' },
      { icon: 'view_carousel', label: '배너 관리', href: '/admin/banners' },
      { icon: 'campaign', label: '공지사항', href: '/admin/notices' },
      { icon: 'support_agent', label: '문의 관리', href: '/admin/inquiries' },
      { icon: 'reviews', label: '리뷰 관리', href: '/admin/reviews' },
      { icon: 'quiz', label: 'FAQ 관리', href: '/admin/faqs' },
    ],
  },
  {
    title: '시스템',
    items: [
      { icon: 'analytics', label: '통계/분석', href: '/admin/analytics' },
      { icon: 'api', label: 'API 모니터링', href: '/admin/api-monitor' },
      { icon: 'history', label: '감사 로그', href: '/admin/audit-log' },
      { icon: 'settings', label: '시스템 설정', href: '/admin/settings' },
    ],
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function AdminSidebar({
  isOpen,
  onClose,
  collapsed,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-outline-variant/20">
        {!collapsed && (
          <>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm font-heading">Y</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold font-heading text-on-surface">YiwuGo Korea</span>
              <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">
                Admin
              </span>
            </div>
          </>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm font-heading">Y</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.title && !collapsed && (
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider px-3 mb-2">
                {group.title}
              </p>
            )}
            {collapsed && group.title && (
              <div className="border-t border-outline-variant/20 mx-2 mb-2" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => onClose()}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive(item.href)
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <span
                      className={cn(
                        'material-symbols-outlined text-xl',
                        isActive(item.href) ? 'text-white' : ''
                      )}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden lg:block border-t border-outline-variant/20 p-3">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-lg">
            {collapsed ? 'chevron_right' : 'chevron_left'}
          </span>
          {!collapsed && <span>접기</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-white z-50 shadow-strong transition-transform duration-300 lg:hidden w-64',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex lg:flex-col lg:fixed lg:top-0 lg:left-0 lg:h-full bg-white border-r border-outline-variant/20 z-30 transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
