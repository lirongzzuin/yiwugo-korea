'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-error/10 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-error text-[56px]">
          error_outline
        </span>
      </div>
      <h1 className="font-heading text-2xl font-bold text-on-surface mb-3">
        문제가 발생했습니다
      </h1>
      <p className="text-on-surface-variant text-sm max-w-sm mb-8 leading-relaxed">
        페이지를 불러오는 중 오류가 발생했습니다.
        잠시 후 다시 시도해 주세요.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => reset()}
          className="px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-container transition-all active:scale-[0.98]"
        >
          다시 시도하기
        </button>
        <a
          href="/"
          className="px-6 py-3 rounded-xl border border-outline-variant/40 text-on-surface font-semibold text-sm hover:bg-surface-container transition-all"
        >
          홈으로 돌아가기
        </a>
      </div>
      {error.digest && (
        <p className="text-xs text-on-surface-variant/60 mt-12">
          오류 코드: {error.digest}
        </p>
      )}
    </div>
  );
}
