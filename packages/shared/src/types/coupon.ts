export enum CouponType {
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  PERCENTAGE = 'PERCENTAGE',
  FREE_SHIPPING = 'FREE_SHIPPING',
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  value: string;
  minOrderAmount?: string;
  maxDiscountAmount?: string;
  categoryId?: string;
  totalQuantity?: number;
  usedQuantity: number;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserCoupon {
  id: string;
  userId: string;
  couponId: string;
  coupon: Coupon;
  isUsed: boolean;
  usedAt?: string;
  orderId?: string;
  receivedAt: string;
  expiresAt: string;
}
