'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

interface Notification {
  id: string;
  type: 'order' | 'price' | 'announcement';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: string;
  iconColor: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: '배송 출발',
    message: 'YWG-2026-041001 주문이 이우 물류센터에서 출발했습니다.',
    time: '2시간 전',
    read: false,
    icon: 'local_shipping',
    iconColor: 'text-tertiary',
  },
  {
    id: '2',
    type: 'order',
    title: '통관 진행 중',
    message: 'YWG-2026-040502 주문이 인천세관에서 통관 심사 중입니다.',
    time: '5시간 전',
    read: false,
    icon: 'gavel',
    iconColor: 'text-purple-600',
  },
  {
    id: '3',
    type: 'price',
    title: '가격 인하 알림',
    message: 'USB-C 멀티 허브 7in1 가격이 18,900원에서 15,900원으로 인하되었습니다.',
    time: '1일 전',
    read: false,
    icon: 'trending_down',
    iconColor: 'text-green-600',
  },
  {
    id: '4',
    type: 'price',
    title: '재입고 알림',
    message: '무선 블루투스 이어버드 TWS 5.3 상품이 재입고되었습니다.',
    time: '1일 전',
    read: false,
    icon: 'inventory',
    iconColor: 'text-orange-600',
  },
  {
    id: '5',
    type: 'order',
    title: '배송 완료',
    message: 'YWG-2026-040103 주문이 배송 완료되었습니다. 리뷰를 남겨주세요!',
    time: '3일 전',
    read: false,
    icon: 'check_circle',
    iconColor: 'text-green-600',
  },
  {
    id: '6',
    type: 'order',
    title: '결제 확인',
    message: 'YWG-2026-032804 주문의 결제가 확인되었습니다.',
    time: '5일 전',
    read: true,
    icon: 'credit_score',
    iconColor: 'text-blue-600',
  },
  {
    id: '7',
    type: 'announcement',
    title: '봄맞이 특가전 오픈',
    message: '생활용품 최대 60% 할인! 4월 한 달간 무료배송 이벤트를 놓치지 마세요.',
    time: '1주 전',
    read: true,
    icon: 'campaign',
    iconColor: 'text-secondary',
  },
  {
    id: '8',
    type: 'announcement',
    title: '배송비 정책 변경 안내',
    message: '5월 1일부터 해상운송 배송비가 일부 조정됩니다. 자세한 내용을 확인해주세요.',
    time: '2주 전',
    read: true,
    icon: 'info',
    iconColor: 'text-tertiary',
  },
];

const CATEGORIES = ['전체', '주문 현황', '가격 알림', '공지사항'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_MAP: Record<Category, Notification['type'] | null> = {
  '전체': null,
  '주문 현황': 'order',
  '가격 알림': 'price',
  '공지사항': 'announcement',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [activeCategory, setActiveCategory] = useState<Category>('전체');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const filtered = activeCategory === '전체'
    ? notifications
    : notifications.filter((n) => n.type === CATEGORY_MAP[activeCategory]);

  const groupedByType = {
    order: filtered.filter((n) => n.type === 'order'),
    price: filtered.filter((n) => n.type === 'price'),
    announcement: filtered.filter((n) => n.type === 'announcement'),
  };

  const sectionLabel: Record<Notification['type'], string> = {
    order: 'Order Status',
    price: 'Price Alerts',
    announcement: 'Announcements',
  };

  return (
    <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto pb-8">
      {/* Bento header */}
      <div className="px-4 pt-4">
        <div className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-5 text-white shadow-medium mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-xl font-bold">Notifications</h1>
              <p className="text-white/80 text-sm mt-1">
                {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-3 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-xs font-semibold hover:bg-white/30 transition-all"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                activeCategory === cat
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notification sections */}
      <div className="px-4 space-y-4">
        {activeCategory === '전체' ? (
          // Grouped view
          (['order', 'price', 'announcement'] as const).map((type) => {
            const items = groupedByType[type];
            if (items.length === 0) return null;

            return (
              <section key={type}>
                <h2 className="font-heading font-bold text-sm text-on-surface-variant uppercase tracking-wide mb-2 px-1">
                  {sectionLabel[type]}
                </h2>
                {type === 'announcement' ? (
                  // Announcement grid
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {items.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => handleMarkRead(notif.id)}
                        className={cn(
                          'text-left rounded-2xl p-4 border transition-all hover:shadow-medium',
                          !notif.read
                            ? 'bg-primary/5 border-primary/20'
                            : 'bg-white border-outline-variant/30'
                        )}
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <span className={cn('material-symbols-outlined text-[20px]', notif.iconColor)}>
                            {notif.icon}
                          </span>
                          {!notif.read && <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />}
                        </div>
                        <h3 className="text-sm font-semibold text-on-surface">{notif.title}</h3>
                        <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-on-surface-variant/50 mt-2">{notif.time}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  // List view
                  <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-soft divide-y divide-outline-variant/20">
                    {items.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => handleMarkRead(notif.id)}
                        className={cn(
                          'flex items-start gap-3 w-full text-left px-4 py-3.5 transition-all hover:bg-surface-container-low',
                          !notif.read && 'bg-primary/5'
                        )}
                      >
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                          !notif.read ? 'bg-primary/10' : 'bg-surface-container'
                        )}>
                          <span className={cn('material-symbols-outlined text-[20px]', notif.iconColor)}>
                            {notif.icon}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-on-surface">{notif.title}</h3>
                            {!notif.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                          </div>
                          <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-on-surface-variant/50 mt-1">{notif.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            );
          })
        ) : (
          // Single category view
          <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-soft divide-y divide-outline-variant/20">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16">
                <span className="material-symbols-outlined text-on-surface-variant/30 text-[48px] mb-3">
                  notifications_off
                </span>
                <p className="text-sm text-on-surface-variant">알림이 없습니다</p>
              </div>
            ) : (
              filtered.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleMarkRead(notif.id)}
                  className={cn(
                    'flex items-start gap-3 w-full text-left px-4 py-3.5 transition-all hover:bg-surface-container-low',
                    !notif.read && 'bg-primary/5'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    !notif.read ? 'bg-primary/10' : 'bg-surface-container'
                  )}>
                    <span className={cn('material-symbols-outlined text-[20px]', notif.iconColor)}>
                      {notif.icon}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-on-surface">{notif.title}</h3>
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{notif.message}</p>
                    <p className="text-[10px] text-on-surface-variant/50 mt-1">{notif.time}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
