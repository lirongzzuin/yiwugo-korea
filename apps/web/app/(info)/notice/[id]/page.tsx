'use client';

import Link from 'next/link';

const NOTICE_DETAIL = {
  id: 1,
  category: '시스템' as const,
  title: '서비스 정기 점검 안내 (4/15 02:00~06:00)',
  date: '2026-04-10',
  content: `안녕하세요, 이우고 코리아입니다.

서비스 안정성 향상을 위한 정기 점검이 아래와 같이 진행될 예정입니다.

■ 점검 일시
- 2026년 4월 15일 (수) 02:00 ~ 06:00 (약 4시간)

■ 점검 영향
- 웹사이트 및 앱 접속 불가
- 주문/결제 기능 일시 중단
- 배송 추적 조회 일시 중단

■ 참고사항
- 점검 시간은 상황에 따라 변경될 수 있습니다.
- 점검 전 진행 중인 결제는 점검 종료 후 정상 처리됩니다.
- 긴급 문의: support@yiwugo.kr

이용에 불편을 드려 죄송합니다.
더 나은 서비스로 보답하겠습니다.

감사합니다.
이우고 코리아 운영팀`,
};

const CATEGORY_STYLES: Record<string, string> = {
  일반: 'bg-stone-100 text-stone-600',
  이벤트: 'bg-amber-50 text-amber-700',
  시스템: 'bg-blue-50 text-blue-700',
};

export default function NoticeDetailPage() {
  const notice = NOTICE_DETAIL;

  return (
    <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto pb-8">
      {/* Header */}
      <div className="bg-white px-5 py-6 border-b border-outline-variant/20">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${CATEGORY_STYLES[notice.category]}`}
          >
            {notice.category}
          </span>
          <span className="text-xs text-on-surface-variant/60">{notice.date}</span>
        </div>
        <h1 className="font-heading font-bold text-lg text-on-surface leading-snug">
          {notice.title}
        </h1>
      </div>

      {/* Content */}
      <div className="bg-white mt-2 px-5 py-6">
        <div className="text-sm text-on-surface leading-relaxed whitespace-pre-line">
          {notice.content}
        </div>
      </div>

      {/* Back button */}
      <div className="px-5 mt-4">
        <Link
          href="/notice"
          className="flex items-center justify-center gap-1 w-full py-3 rounded-xl bg-surface-container text-on-surface-variant text-sm font-semibold hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
