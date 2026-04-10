const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * Format a date in Korean format
 * @param date - Date object or ISO string
 * @param format - 'full' | 'date' | 'time' | 'short' | 'datetime'
 */
export function formatDate(
  date: Date | string,
  format: 'full' | 'date' | 'time' | 'short' | 'datetime' = 'date',
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const kst = toKST(d);
  const y = kst.getUTCFullYear();
  const m = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const h = kst.getUTCHours();
  const min = kst.getUTCMinutes();

  const pad = (n: number) => String(n).padStart(2, '0');

  switch (format) {
    case 'full':
      return `${y}년 ${m}월 ${day}일 ${pad(h)}:${pad(min)}`;
    case 'date':
      return `${y}.${pad(m)}.${pad(day)}`;
    case 'time':
      return `${pad(h)}:${pad(min)}`;
    case 'short':
      return `${m}/${day}`;
    case 'datetime':
      return `${y}.${pad(m)}.${pad(day)} ${pad(h)}:${pad(min)}`;
    default:
      return `${y}.${pad(m)}.${pad(day)}`;
  }
}

/**
 * Format a date as relative time in Korean
 * @returns "방금 전", "3분 전", "2시간 전", "어제", "3일 전", "2024.01.15"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay === 1) return '어제';
  if (diffDay < 7) return `${diffDay}일 전`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}주 전`;

  return formatDate(d, 'date');
}

/**
 * Convert a date to KST (UTC+9) represented as a UTC Date
 * The returned Date's getUTC*() methods return KST values
 */
export function toKST(date: Date): Date {
  return new Date(date.getTime() + KST_OFFSET_MS);
}

/**
 * Check if a date is a Korean business day (Mon-Fri, excluding known holidays)
 */
export function isBusinessDay(date: Date): boolean {
  const kst = toKST(date);
  const day = kst.getUTCDay();
  // Saturday (6) and Sunday (0) are not business days
  if (day === 0 || day === 6) return false;

  // Check major Korean public holidays (fixed dates)
  const m = kst.getUTCMonth() + 1;
  const d = kst.getUTCDate();
  const fixedHolidays = [
    [1, 1],   // New Year's Day
    [3, 1],   // Independence Movement Day
    [5, 5],   // Children's Day
    [6, 6],   // Memorial Day
    [8, 15],  // Liberation Day
    [10, 3],  // National Foundation Day
    [10, 9],  // Hangul Day
    [12, 25], // Christmas
  ];

  for (const [hm, hd] of fixedHolidays) {
    if (m === hm && d === hd) return false;
  }

  return true;
}
