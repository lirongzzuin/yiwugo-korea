export enum NotificationType {
  ORDER_STATUS = 'ORDER_STATUS',
  PAYMENT = 'PAYMENT',
  SHIPPING = 'SHIPPING',
  CUSTOMS = 'CUSTOMS',
  PRICE_DROP = 'PRICE_DROP',
  COUPON = 'COUPON',
  POINT = 'POINT',
  EVENT = 'EVENT',
  NOTICE = 'NOTICE',
  REVIEW_REMINDER = 'REVIEW_REMINDER',
  SYSTEM = 'SYSTEM',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  linkUrl?: string;
  imageUrl?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}
