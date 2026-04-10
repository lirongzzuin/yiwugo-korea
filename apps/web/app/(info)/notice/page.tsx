'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';

interface Notice {
  id: number;
  category: '일반' | '이벤트' | '시스템';
  title: string;
  date: string;
  pinned: boolean;
}

const CATEGORY_STYLES: Record<Notice['category'], string> = {
  일반: 'bg-stone-100 text-stone-600',
  이벤트: 'bg-amber-50 text-amber-700',
  시스템: 'bg-blue-50 text-blue-700',
};

const NOTICES: Notice[] = [
  {
    id: 1,
    category: '시스템',
    title: '서비스 정기 점검 안내 (4/15 02:00~06:00)',
    date: '2026-04-10',
    pinned: true,
  },
  {
    id: 2,
    category: '이벤트',
    title: '봄맞이 신규 회원 가입 이벤트 - 배송비 50% 할인',
    date: '2026-04-08',
    pinned: true,
  },
  {
    id: 3,
    category: '일반',
    title: '이우고 코리아 서비스 이용약관 변경 안내',
    date: '2026-04-05',
    pinned: false,
  },
  {
    id: 4,
    category: '이벤트',
    title: '리뷰 작성 시 포인트 적립 이벤트 안내',
    date: '2026-04-03',
    pinned: false,
  },
  {
    id: 5,
    category: '일반',
    title: '2026년 중국 노동절 연휴 배송 지연 안내',
    date: '2026-04-01',
    pinned: false,
  },
  {
    id: 6,
    category: '시스템',
    title: '결제 시스템 업그레이드 완료 안내',
    date: '2026-03-28',
    pinned: false,
  },
  {
    id: 7,
    category: '일반',
    title: '해상 운송 요금 변경 안내 (2026년 4월~)',
    date: '2026-03-25',
    pinned: false,
  },
  {
    id: 8,
    category: '이벤트',
    title: '대량 구매 고객 전용 VIP 프로그램 출시',
    date: '2026-03-20',
    pinned: false,
  },
];

export default function NoticePage() {
  return (
    <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto pb-8">
      <div className="bg-white px-5 py-6 border-b border-outline-variant/20">
        <h1 className="font-heading font-bold text-xl text-on-surface">공지사항</h1>
      </div>

      <div className="mt-2 bg-white divide-y divide-outline-variant/20">
        {NOTICES.map((notice) => (
          <Link
            key={notice.id}
            href={`/notice/${notice.id}`}
            className={cn(
              'flex items-start gap-3 px-5 py-4 hover:bg-surface-container-low transition-colors',
              notice.pinned && 'bg-primary/[0.02]'
            )}
          >
            {notice.pinned && (
              <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 flex-shrink-0">
                push_pin
              </span>
            )}
            <div className={cn('flex-1 min-w-0', !notice.pinned && 'ml-[26px]')}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-semibold',
                    CATEGORY_STYLES[notice.category]
                  )}
                >
                  {notice.category}
                </span>
              </div>
              <p
                className={cn(
                  'text-sm leading-relaxed line-clamp-1',
                  notice.pinned ? 'font-semibold text-on-surface' : 'text-on-surface'
                )}
              >
                {notice.title}
              </p>
              <span className="text-xs text-on-surface-variant/60 mt-1 block">{notice.date}</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant/30 text-[18px] mt-1 flex-shrink-0">
              chevron_right
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
