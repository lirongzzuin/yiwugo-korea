import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-on-surface-variant/40 text-[56px]">
          search_off
        </span>
      </div>
      <h1 className="font-heading text-3xl font-bold text-on-surface mb-3">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-on-surface-variant text-sm max-w-sm mb-8 leading-relaxed">
        요청하신 페이지가 존재하지 않거나, 주소가 변경되었을 수 있습니다.
        주소를 다시 확인해 주세요.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-container transition-all active:scale-[0.98]"
        >
          홈으로 돌아가기
        </Link>
        <Link
          href="/search"
          className="px-6 py-3 rounded-xl border border-outline-variant/40 text-on-surface font-semibold text-sm hover:bg-surface-container transition-all"
        >
          상품 검색하기
        </Link>
      </div>
      <p className="text-xs text-on-surface-variant/60 mt-12">
        오류 코드: 404 | 이우고 코리아
      </p>
    </div>
  );
}
