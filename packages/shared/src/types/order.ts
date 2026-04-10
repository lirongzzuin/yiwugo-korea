import type { Address } from './user';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  ORDERED_TO_YIWUGO = 'ORDERED_TO_YIWUGO',
  YIWUGO_CONFIRMED = 'YIWUGO_CONFIRMED',
  PREPARING = 'PREPARING',
  SHIPPING_FROM_CHINA = 'SHIPPING_FROM_CHINA',
  IN_TRANSIT = 'IN_TRANSIT',
  IN_CUSTOMS = 'IN_CUSTOMS',
  CUSTOMS_CLEARED = 'CUSTOMS_CLEARED',
  DOMESTIC_SHIPPING = 'DOMESTIC_SHIPPING',
  DELIVERED = 'DELIVERED',
  PURCHASE_CONFIRMED = 'PURCHASE_CONFIRMED',
  CANCELLED = 'CANCELLED',
  REFUND_REQUESTED = 'REFUND_REQUESTED',
  REFUNDED = 'REFUNDED',
}

export enum ShippingMethod {
  AIR = 'AIR',
  SEA = 'SEA',
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalKrw: string;
  totalCny: string;
  shippingFeeKrw: string;
  discountKrw: string;
  pointsUsed: number;
  commissionKrw: string;
  exchangeRate: string;
  commissionRate: string;
  shippingAddress: Address;
  customsCode?: string;
  shippingMethod: ShippingMethod;
  trackingNumbers?: TrackingNumbers;
  yiwugoOrderId?: string;
  couponId?: string;
  deliveryMemo?: string;
  estimatedDelivery?: string;
  purchaseConfirmedAt?: string;
  cancelReason?: string;
  adminMemo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  priceKrw: string;
  priceCny: string;
  options?: Record<string, string>;
  imageUrl?: string;
}

export interface TrackingNumbers {
  china?: string;
  international?: string;
  domestic?: string;
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
    options?: Record<string, string>;
  }>;
  shippingAddressId: string;
  shippingMethod: ShippingMethod;
  couponId?: string;
  pointsToUse?: number;
  deliveryMemo?: string;
  customsCode?: string;
}

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: 'created_at' | 'updated_at' | 'total_krw';
  sortOrder?: 'asc' | 'desc';
}
