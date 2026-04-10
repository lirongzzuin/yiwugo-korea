import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@prisma/prisma.service';
import { PaymentProvider, PaymentStatus } from '@prisma/client';
import { TossPaymentsProvider } from './providers/toss-payments.provider';
import { KakaoPayProvider } from './providers/kakao-pay.provider';
import { IPaymentProvider } from './providers/payment-provider.interface';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly providers: Record<string, IPaymentProvider>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly tossProvider: TossPaymentsProvider,
    private readonly kakaoProvider: KakaoPayProvider,
  ) {
    this.providers = {
      [PaymentProvider.TOSS_PAYMENTS]: this.tossProvider,
      [PaymentProvider.KAKAO_PAY]: this.kakaoProvider,
    };
  }

  private getProvider(provider: PaymentProvider): IPaymentProvider {
    const p = this.providers[provider];
    if (!p) {
      throw new BadRequestException(`지원하지 않는 결제 수단입니다: ${provider}`);
    }
    return p;
  }

  /**
   * Initiate a payment for an order
   */
  async initiatePayment(
    orderId: string,
    provider: PaymentProvider,
    method?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    // Check if payment already exists
    const existing = await this.prisma.payment.findUnique({
      where: { orderId },
    });
    if (existing && existing.status === PaymentStatus.APPROVED) {
      throw new BadRequestException('이미 결제가 완료된 주문입니다.');
    }

    const amount = Number(order.totalKrw);
    const orderName =
      order.items.length > 1
        ? `${order.items[0].productName} 외 ${order.items.length - 1}건`
        : order.items[0]?.productName ?? '이우고 주문';

    const pg = this.getProvider(provider);
    const result = await pg.initiatePayment(order.orderNumber, amount, orderName);

    // Create or update payment record
    if (existing) {
      await this.prisma.payment.update({
        where: { id: existing.id },
        data: {
          provider,
          method,
          amount,
          status: PaymentStatus.PENDING,
          providerPaymentId: result.transactionId,
        },
      });
    } else {
      await this.prisma.payment.create({
        data: {
          orderId,
          provider,
          method,
          amount,
          status: PaymentStatus.PENDING,
          providerPaymentId: result.transactionId,
        },
      });
    }

    return result;
  }

  /**
   * Approve a payment (callback from PG after user completes payment)
   */
  async approvePayment(
    paymentKey: string,
    orderId: string,
    amount: number,
  ) {
    // Find order by orderNumber (PG uses orderNumber, not DB id)
    const order = await this.prisma.order.findUnique({
      where: { orderNumber: orderId },
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { orderId: order.id },
    });

    if (!payment) {
      throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
    }

    // Verify amount matches
    if (Number(payment.amount) !== amount) {
      this.logger.error(
        `Payment amount mismatch: expected=${payment.amount}, received=${amount}`,
      );
      throw new BadRequestException('결제 금액이 일치하지 않습니다.');
    }

    const pg = this.getProvider(payment.provider);

    try {
      const result = await pg.approvePayment(paymentKey, orderId, amount);

      const updated = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentKey: result.paymentKey,
          status: PaymentStatus.APPROVED,
          method: result.method ?? payment.method,
          paidAt: new Date(result.paidAt),
          receiptUrl: result.receiptUrl,
          rawResponse: result.raw,
        },
      });

      // Emit event for order module to update status
      this.eventEmitter.emit('payment.approved', {
        orderId: order.id,
        paymentId: updated.id,
        amount,
      });

      this.logger.log(
        `Payment approved: orderId=${order.id}, paymentKey=${result.paymentKey}`,
      );

      return updated;
    } catch (error: any) {
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.FAILED,
          rawResponse: { error: error?.message ?? 'Unknown error' },
        },
      });
      this.logger.error('Payment approval failed', error);
      throw new InternalServerErrorException('결제 승인에 실패했습니다.');
    }
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(paymentId: string, reason: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
    }

    if (payment.status !== PaymentStatus.APPROVED) {
      throw new BadRequestException('승인된 결제만 취소할 수 있습니다.');
    }

    if (!payment.paymentKey) {
      throw new BadRequestException('결제 키가 없습니다.');
    }

    const pg = this.getProvider(payment.provider);

    try {
      const result = await pg.cancelPayment(payment.paymentKey, reason);

      const updated = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.CANCELLED,
          cancelledAt: new Date(result.cancelledAt),
          rawResponse: result.raw,
        },
      });

      this.logger.log(`Payment cancelled: paymentId=${paymentId}`);
      return updated;
    } catch (error) {
      this.logger.error('Payment cancellation failed', error);
      throw new InternalServerErrorException('결제 취소에 실패했습니다.');
    }
  }

  /**
   * Refund a payment (partial or full)
   */
  async refundPayment(paymentId: string, amount: number, reason: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
    }

    if (
      payment.status !== PaymentStatus.APPROVED &&
      payment.status !== PaymentStatus.PARTIAL_REFUNDED
    ) {
      throw new BadRequestException('환불할 수 없는 결제 상태입니다.');
    }

    if (!payment.paymentKey) {
      throw new BadRequestException('결제 키가 없습니다.');
    }

    const pg = this.getProvider(payment.provider);

    try {
      const result = await pg.refundPayment(payment.paymentKey, amount, reason);

      const isFullRefund = amount >= Number(payment.amount);
      const newStatus = isFullRefund
        ? PaymentStatus.REFUNDED
        : PaymentStatus.PARTIAL_REFUNDED;

      const updated = await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: newStatus,
          rawResponse: result.raw,
        },
      });

      this.logger.log(
        `Payment refunded: paymentId=${paymentId}, amount=${amount}, full=${isFullRefund}`,
      );
      return updated;
    } catch (error) {
      this.logger.error('Payment refund failed', error);
      throw new InternalServerErrorException('환불 처리에 실패했습니다.');
    }
  }

  /**
   * Handle PG webhook
   */
  async handleWebhook(
    provider: PaymentProvider,
    body: any,
    headers: any,
  ) {
    const pg = this.getProvider(provider);

    if (!pg.verifyWebhook(body, headers)) {
      this.logger.warn(`Invalid webhook signature from ${provider}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    // Process based on event type
    const eventType = body.eventType || body.type;
    this.logger.log(`Webhook received: provider=${provider}, type=${eventType}`);

    if (
      eventType === 'PAYMENT_STATUS_CHANGED' ||
      eventType === 'payment.done'
    ) {
      const paymentKey = body.data?.paymentKey || body.paymentKey;
      if (paymentKey) {
        const payment = await this.prisma.payment.findUnique({
          where: { paymentKey },
        });
        if (payment) {
          // Update payment status from webhook
          this.logger.log(
            `Webhook status update for payment ${payment.id}`,
          );
        }
      }
    }

    return { status: 'ok' };
  }

  /**
   * Get payment info for an order
   */
  async getPayment(orderId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      throw new NotFoundException('결제 정보를 찾을 수 없습니다.');
    }

    return payment;
  }
}
