export interface AdminDashboardKPI {
  totalOrders: number;
  totalRevenue: string;
  totalCommission: string;
  activeUsers: number;
  newUsersToday: number;
  pendingOrders: number;
  shippingOrders: number;
  customsHeldOrders: number;
  avgOrderValue: string;
  conversionRate: number;
  periodStart: string;
  periodEnd: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress: string;
  userAgent?: string;
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: 'HOME_TOP' | 'HOME_MIDDLE' | 'CATEGORY' | 'SEARCH';
  sortOrder: number;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: 'GENERAL' | 'EVENT' | 'MAINTENANCE' | 'POLICY';
  isPinned: boolean;
  isPublished: boolean;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
}

export interface StaticPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  isPublished: boolean;
  updatedAt: string;
}

export interface SystemSettings {
  defaultExchangeRate: string;
  defaultCommissionRate: string;
  minOrderAmountKrw: string;
  freeShippingThresholdKrw: string;
  maxPointUsageRate: number;
  pointEarnRate: number;
  autoConfirmDays: number;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  yiwugoApiBaseUrl: string;
  yiwugoApiKey: string;
}
