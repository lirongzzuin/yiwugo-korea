import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '@prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

export interface OrderCreatedEvent {
  orderId: string;
  orderNumber: string;
  userId: string;
}

export interface PaymentApprovedEvent {
  orderId: string;
  paymentId: string;
  amount: number;
}

export interface OrderStatusChangedEvent {
  orderId: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  adminId?: string;
}

@Injectable()
export class OrderEventHandler {
  private readonly logger = new Logger(OrderEventHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    this.logger.log(
      `Order created: ${event.orderNumber} (${event.orderId}) by user ${event.userId}`,
    );
  }

  @OnEvent('payment.approved')
  async handlePaymentApproved(event: PaymentApprovedEvent) {
    this.logger.log(
      `Payment approved for order ${event.orderId}, amount=${event.amount}`,
    );

    try {
      // Update order status to PAID
      await this.prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: event.orderId },
          data: { status: OrderStatus.PAID },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: event.orderId,
            status: OrderStatus.PAID,
            note: '결제 완료',
          },
        });
      });

      this.logger.log(`Order ${event.orderId} status updated to PAID`);
    } catch (error) {
      this.logger.error(
        `Failed to update order status on payment approval: ${event.orderId}`,
        error,
      );
    }
  }

  @OnEvent('order.status.changed')
  async handleOrderStatusChanged(event: OrderStatusChangedEvent) {
    this.logger.log(
      `Order ${event.orderId}: ${event.oldStatus} → ${event.newStatus}`,
    );

    try {
      // Get order to find userId
      const order = await this.prisma.order.findUnique({
        where: { id: event.orderId },
        select: { userId: true, orderNumber: true },
      });

      if (!order) return;

      // Build notification message based on new status
      const messages: Record<string, { title: string; message: string }> = {
        [OrderStatus.PAID]: {
          title: '결제 완료',
          message: `주문 ${order.orderNumber}의 결제가 완료되었습니다.`,
        },
        [OrderStatus.ORDERED_TO_YIWUGO]: {
          title: '이우고 주문 접수',
          message: `주문 ${order.orderNumber}이 이우고에 발주되었습니다.`,
        },
        [OrderStatus.YIWUGO_CONFIRMED]: {
          title: '이우고 주문 확인',
          message: `주문 ${order.orderNumber}이 이우고에서 확인되었습니다.`,
        },
        [OrderStatus.PREPARING]: {
          title: '상품 준비 중',
          message: `주문 ${order.orderNumber}의 상품이 준비 중입니다.`,
        },
        [OrderStatus.SHIPPING_FROM_CHINA]: {
          title: '중국 출발',
          message: `주문 ${order.orderNumber}이 중국에서 출발했습니다.`,
        },
        [OrderStatus.IN_TRANSIT]: {
          title: '운송 중',
          message: `주문 ${order.orderNumber}이 운송 중입니다.`,
        },
        [OrderStatus.IN_CUSTOMS]: {
          title: '통관 진행 중',
          message: `주문 ${order.orderNumber}이 세관에서 통관 중입니다.`,
        },
        [OrderStatus.CUSTOMS_CLEARED]: {
          title: '통관 완료',
          message: `주문 ${order.orderNumber}의 통관이 완료되었습니다.`,
        },
        [OrderStatus.DOMESTIC_SHIPPING]: {
          title: '국내 배송 중',
          message: `주문 ${order.orderNumber}이 국내 택배로 발송되었습니다.`,
        },
        [OrderStatus.DELIVERED]: {
          title: '배송 완료',
          message: `주문 ${order.orderNumber}이 배송 완료되었습니다. 7일 후 자동 구매확정됩니다.`,
        },
        [OrderStatus.PURCHASE_CONFIRMED]: {
          title: '구매 확정',
          message: `주문 ${order.orderNumber}이 구매 확정되었습니다. 포인트가 적립되었습니다.`,
        },
        [OrderStatus.CANCELLED]: {
          title: '주문 취소',
          message: `주문 ${order.orderNumber}이 취소되었습니다.`,
        },
        [OrderStatus.REFUND_REQUESTED]: {
          title: '환불 요청',
          message: `주문 ${order.orderNumber}의 환불이 요청되었습니다.`,
        },
        [OrderStatus.REFUNDED]: {
          title: '환불 완료',
          message: `주문 ${order.orderNumber}의 환불이 완료되었습니다.`,
        },
      };

      const msg = messages[event.newStatus];
      if (msg) {
        await this.prisma.notification.create({
          data: {
            userId: order.userId,
            type: 'ORDER_STATUS',
            title: msg.title,
            message: msg.message,
            data: {
              orderId: event.orderId,
              orderNumber: order.orderNumber,
              status: event.newStatus,
            },
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to send notification for order ${event.orderId}`,
        error,
      );
    }
  }
}
