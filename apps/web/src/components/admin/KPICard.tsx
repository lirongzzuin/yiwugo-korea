'use client';

import { cn } from '@/lib/cn';

interface KPICardProps {
  icon: string;
  label: string;
  value: string;
  change?: {
    value: number;
    direction: 'up' | 'down';
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
}

const variantStyles: Record<string, { icon: string; bg: string }> = {
  default: { icon: 'text-on-surface-variant', bg: 'bg-surface-container' },
  primary: { icon: 'text-primary', bg: 'bg-primary/10' },
  success: { icon: 'text-green-600', bg: 'bg-green-50' },
  warning: { icon: 'text-amber-600', bg: 'bg-amber-50' },
  error: { icon: 'text-error', bg: 'bg-red-50' },
};

export default function KPICard({
  icon,
  label,
  value,
  change,
  variant = 'default',
}: KPICardProps) {
  const styles = variantStyles[variant];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-soft border border-outline-variant/30 hover:shadow-medium transition-shadow">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center',
            styles.bg
          )}
        >
          <span className={cn('material-symbols-outlined text-xl', styles.icon)}>
            {icon}
          </span>
        </div>
        {change && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full',
              change.direction === 'up'
                ? 'text-green-700 bg-green-50'
                : 'text-red-700 bg-red-50'
            )}
          >
            <span className="material-symbols-outlined text-sm">
              {change.direction === 'up' ? 'trending_up' : 'trending_down'}
            </span>
            {Math.abs(change.value)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold font-heading text-on-surface">{value}</p>
        <p className="text-sm text-on-surface-variant mt-1">{label}</p>
      </div>
    </div>
  );
}
