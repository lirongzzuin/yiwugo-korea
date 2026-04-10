'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import AdminSidebar from '@/components/admin/AdminSidebar';

const breadcrumbMap: Record<string, string> = {
  admin: '관리자',
  orders: '주문 관리',
  products: '상품 관리',
  users: '회원 관리',
  settlements: '정산 관리',
  'exchange-rate': '환율 관리',
  translations: '번역 관리',
  coupons: '쿠폰 관리',
  banners: '배너 관리',
  notices: '공지사항',
  inquiries: '문의 관리',
  reviews: '리뷰 관리',
  faqs: 'FAQ 관리',
  analytics: '통계/분석',
  'api-monitor': 'API 모니터링',
  'audit-log': '감사 로그',
  settings: '시스템 설정',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: breadcrumbMap[seg] || seg,
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <div
        className={cn(
          'transition-all duration-300',
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-outline-variant/20">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-surface-container"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>

              {/* Breadcrumb */}
              <nav className="flex items-center gap-1.5 text-sm">
                {breadcrumbs.map((crumb, i) => (
                  <div key={crumb.href} className="flex items-center gap-1.5">
                    {i > 0 && (
                      <span className="material-symbols-outlined text-sm text-on-surface-variant/50">
                        chevron_right
                      </span>
                    )}
                    <span
                      className={cn(
                        crumb.isLast
                          ? 'font-semibold text-on-surface'
                          : 'text-on-surface-variant'
                      )}
                    >
                      {crumb.label}
                    </span>
                  </div>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-xl hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">
                  notifications
                </span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
              </button>
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-outline-variant/30">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold text-sm">A</span>
                </div>
                <span className="text-sm font-medium text-on-surface">관리자</span>
              </div>
              <button className="p-2 rounded-xl hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">
                  logout
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
