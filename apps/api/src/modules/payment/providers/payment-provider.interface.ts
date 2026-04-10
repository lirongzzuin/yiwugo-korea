export interface PaymentInitResult {
  /** URL or data the client needs to proceed with payment */
  checkoutUrl?: string;
  /** Provider-specific transaction ID */
  transactionId?: string;
  /** Any extra data from the provider */
  raw?: any;
}

export interface PaymentApproveResult {
  paymentKey: string;
  orderId: string;
  amount: number;
  method?: string;
  paidAt: string;
  receiptUrl?: string;
  raw?: any;
}

export interface PaymentCancelResult {
  paymentKey: string;
  cancelledAt: string;
  cancelAmount: number;
  raw?: any;
}

export interface PaymentRefundResult {
  paymentKey: string;
  refundedAt: string;
  refundAmount: number;
  raw?: any;
}

export interface IPaymentProvider {
  initiatePayment(
    orderId: string,
    amount: number,
    orderName: string,
  ): Promise<PaymentInitResult>;

  approvePayment(
    paymentKey: string,
    orderId: string,
    amount: number,
  ): Promise<PaymentApproveResult>;

  cancelPayment(
    paymentKey: string,
    reason: string,
  ): Promise<PaymentCancelResult>;

  refundPayment(
    paymentKey: string,
    amount: number,
    reason: string,
  ): Promise<PaymentRefundResult>;

  verifyWebhook(body: any, headers: any): boolean;
}
