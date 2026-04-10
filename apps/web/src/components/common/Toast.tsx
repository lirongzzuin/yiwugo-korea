'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/cn';
import { useUIStore, type ToastType } from '@/stores/ui-store';

const ICON_MAP: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

const COLOR_MAP: Record<ToastType, string> = {
  success: 'bg-emerald-600',
  error: 'bg-error',
  warning: 'bg-secondary',
  info: 'bg-tertiary',
};

export default function Toast() {
  const { toast, hideToast } = useUIStore();

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(hideToast, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible, hideToast]);

  if (!toast.visible) return null;

  return (
    <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div
        className={cn(
          'flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-strong text-white min-w-[280px] max-w-[90vw]',
          COLOR_MAP[toast.type]
        )}
        role="alert"
      >
        <span className="material-symbols-outlined filled text-[20px] shrink-0">
          {ICON_MAP[toast.type]}
        </span>
        <p className="text-sm font-medium flex-1">{toast.message}</p>
        <button
          onClick={hideToast}
          className="p-0.5 rounded-full hover:bg-white/20 transition-colors shrink-0"
          aria-label="닫기"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
}
