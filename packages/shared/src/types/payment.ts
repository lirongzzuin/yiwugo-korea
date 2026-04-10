export enum PaymentProvider {
  TOSS_PAYMENTS = 'TOSS_PAYMENTS',
  KAKAO_PAY = 'KAKAO_PAY',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIAL_REFUNDED = 'PARTIAL_REFUNDED',
}

export interface Payment {
  id: string;
  orderId: string;
  provider: PaymentProvider;
  providerPaymentId?: string;
  paymentKey?: string;
  method?: string;
  amount: string;
  status: PaymentStatus;
  paidAt?: string;
  cancelledAt?: string;
  receiptUrl?: string;
  cashReceiptIssued: boolean;
}

export interface PaymentRequest {
  orderId: string;
  provider: PaymentProvider;
  amount: string;
  method?: string;
  successUrl: string;
  failUrl: string;
}

export interface PaymentApproveRequest {
  paymentKey: string;
  orderId: string;
  amount: string;
}

export interface PaymentCancelRequest {
  paymentKey: string;
  cancelReason: string;
  cancelAmount?: string;
}
