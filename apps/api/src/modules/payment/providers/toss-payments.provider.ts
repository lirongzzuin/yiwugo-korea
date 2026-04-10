import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';
import {
  IPaymentProvider,
  PaymentInitResult,
  PaymentApproveResult,
  PaymentCancelResult,
  PaymentRefundResult,
} from './payment-provider.interface';

const TOSS_API_BASE = 'https://api.tosspayments.com/v1';

@Injectable()
export class TossPaymentsProvider implements IPaymentProvider {
  private readonly logger = new Logger(TossPaymentsProvider.name);
  private readonly secretKey: string;
  private readonly webhookSecret: string;
  private readonly authHeader: string;

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('TOSS_PAYMENTS_SECRET_KEY', '');
    this.webhookSecret = this.configService.get<string>('TOSS_PAYMENTS_WEBHOOK_SECRET', '');
    // Toss requires Base64-encoded secretKey + ':' for Basic auth
    this.authHeader = `Basic ${Buffer.from(this.secretKey + ':').toString('base64')}`;
  }

  async initiatePayment(
    orderId: string,
    amount: number,
    orderName: string,
  ): Promise<PaymentInitResult> {
    // For Toss Payments, the client SDK handles initiation.
    // We return the orderId and amount for the client to use.
    return {
      transactionId: orderId,
      raw: { orderId, amount, orderName },
    };
  }

  async approvePayment(
    paymentKey: string,
    orderId: string,
    amount: number,
  ): Promise<PaymentApproveResult> {
    const response = await axios.post(
      `${TOSS_API_BASE}/payments/confirm`,
      { paymentKey, orderId, amount },
      {
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/json',
        },
        timeout: 30_000,
      },
    );

    const data = response.data;

    return {
      paymentKey: data.paymentKey,
      orderId: data.orderId,
      amount: data.totalAmount,
      method: data.method,
      paidAt: data.approvedAt,
      receiptUrl: data.receipt?.url,
      raw: data,
    };
  }

  async cancelPayment(
    paymentKey: string,
    reason: string,
  ): Promise<PaymentCancelResult> {
    const response = await axios.post(
      `${TOSS_API_BASE}/payments/${paymentKey}/cancel`,
      { cancelReason: reason },
      {
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/json',
        },
        timeout: 30_000,
      },
    );

    const data = response.data;
    const lastCancel = data.cancels?.[data.cancels.length - 1];

    return {
      paymentKey: data.paymentKey,
      cancelledAt: lastCancel?.canceledAt ?? new Date().toISOString(),
      cancelAmount: lastCancel?.cancelAmount ?? data.totalAmount,
      raw: data,
    };
  }

  async refundPayment(
    paymentKey: string,
    amount: number,
    reason: string,
  ): Promise<PaymentRefundResult> {
    const response = await axios.post(
      `${TOSS_API_BASE}/payments/${paymentKey}/cancel`,
      {
        cancelReason: reason,
        cancelAmount: amount,
      },
      {
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/json',
        },
        timeout: 30_000,
      },
    );

    const data = response.data;
    const lastCancel = data.cancels?.[data.cancels.length - 1];

    return {
      paymentKey: data.paymentKey,
      refundedAt: lastCancel?.canceledAt ?? new Date().toISOString(),
      refundAmount: lastCancel?.cancelAmount ?? amount,
      raw: data,
    };
  }

  verifyWebhook(body: any, headers: any): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('Webhook secret not configured');
      return false;
    }

    try {
      const signature = headers['toss-signature'] || headers['Toss-Signature'];
      if (!signature) return false;

      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      const expected = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('base64');

      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected),
      );
    } catch (error) {
      this.logger.error('Webhook verification failed', error);
      return false;
    }
  }
}
