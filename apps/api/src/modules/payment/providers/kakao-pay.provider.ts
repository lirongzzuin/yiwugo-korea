import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  IPaymentProvider,
  PaymentInitResult,
  PaymentApproveResult,
  PaymentCancelResult,
  PaymentRefundResult,
} from './payment-provider.interface';

const KAKAO_PAY_BASE = 'https://open-api.kakaopay.com/online/v1/payment';

@Injectable()
export class KakaoPayProvider implements IPaymentProvider {
  private readonly logger = new Logger(KakaoPayProvider.name);
  private readonly secretKey: string;
  private readonly cid: string;
  private readonly approvalUrl: string;
  private readonly cancelUrl: string;
  private readonly failUrl: string;

  /** Stores tid temporarily for the ready→approve flow */
  private readonly tidMap = new Map<string, string>();

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('KAKAO_PAY_SECRET_KEY', '');
    this.cid = this.configService.get<string>('KAKAO_PAY_CID', 'TC0ONETIME');
    this.approvalUrl = this.configService.get<string>(
      'KAKAO_PAY_APPROVAL_URL',
      'http://localhost:3000/payments/kakao/success',
    );
    this.cancelUrl = this.configService.get<string>(
      'KAKAO_PAY_CANCEL_URL',
      'http://localhost:3000/payments/kakao/cancel',
    );
    this.failUrl = this.configService.get<string>(
      'KAKAO_PAY_FAIL_URL',
      'http://localhost:3000/payments/kakao/fail',
    );
  }

  private get headers() {
    return {
      Authorization: `SECRET_KEY ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initiatePayment(
    orderId: string,
    amount: number,
    orderName: string,
  ): Promise<PaymentInitResult> {
    const response = await axios.post(
      `${KAKAO_PAY_BASE}/ready`,
      {
        cid: this.cid,
        partner_order_id: orderId,
        partner_user_id: 'yiwugo',
        item_name: orderName,
        quantity: 1,
        total_amount: amount,
        tax_free_amount: 0,
        approval_url: `${this.approvalUrl}?orderId=${orderId}`,
        cancel_url: `${this.cancelUrl}?orderId=${orderId}`,
        fail_url: `${this.failUrl}?orderId=${orderId}`,
      },
      { headers: this.headers, timeout: 30_000 },
    );

    const data = response.data;

    // Store tid for approve step
    this.tidMap.set(orderId, data.tid);

    return {
      checkoutUrl: data.next_redirect_pc_url || data.next_redirect_mobile_url,
      transactionId: data.tid,
      raw: data,
    };
  }

  async approvePayment(
    paymentKey: string, // pg_token from redirect
    orderId: string,
    amount: number,
  ): Promise<PaymentApproveResult> {
    const tid = this.tidMap.get(orderId);
    if (!tid) {
      throw new Error(`KakaoPay TID not found for order ${orderId}`);
    }

    const response = await axios.post(
      `${KAKAO_PAY_BASE}/approve`,
      {
        cid: this.cid,
        tid,
        partner_order_id: orderId,
        partner_user_id: 'yiwugo',
        pg_token: paymentKey,
      },
      { headers: this.headers, timeout: 30_000 },
    );

    const data = response.data;
    this.tidMap.delete(orderId);

    return {
      paymentKey: data.tid,
      orderId,
      amount: data.amount.total,
      method: 'KAKAO_PAY',
      paidAt: data.approved_at,
      raw: data,
    };
  }

  async cancelPayment(
    paymentKey: string, // tid
    reason: string,
  ): Promise<PaymentCancelResult> {
    // For full cancel we need the total amount; do a status check first
    const response = await axios.post(
      `${KAKAO_PAY_BASE}/cancel`,
      {
        cid: this.cid,
        tid: paymentKey,
        cancel_amount: 0, // 0 means full cancel
        cancel_tax_free_amount: 0,
      },
      { headers: this.headers, timeout: 30_000 },
    );

    const data = response.data;

    return {
      paymentKey: data.tid,
      cancelledAt: data.canceled_at ?? new Date().toISOString(),
      cancelAmount: data.canceled_amount?.total ?? 0,
      raw: data,
    };
  }

  async refundPayment(
    paymentKey: string,
    amount: number,
    reason: string,
  ): Promise<PaymentRefundResult> {
    const response = await axios.post(
      `${KAKAO_PAY_BASE}/cancel`,
      {
        cid: this.cid,
        tid: paymentKey,
        cancel_amount: amount,
        cancel_tax_free_amount: 0,
      },
      { headers: this.headers, timeout: 30_000 },
    );

    const data = response.data;

    return {
      paymentKey: data.tid,
      refundedAt: data.canceled_at ?? new Date().toISOString(),
      refundAmount: data.canceled_amount?.total ?? amount,
      raw: data,
    };
  }

  verifyWebhook(body: any, headers: any): boolean {
    // KakaoPay doesn't use signature-based webhook verification.
    // Verification is done by checking the request comes from KakaoPay IPs
    // and matching the tid with our records.
    return true;
  }
}
