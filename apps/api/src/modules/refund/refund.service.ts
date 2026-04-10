import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@prisma/prisma.service';
import { OrderStatus, RefundStatus, PaymentStatus } from '@prisma/client';
import { PaymentService } from '@modules/payment/payment.service';
import { CouponService } from '@modules/coupon/coupon.service';
import { PointsService } from '@modules/points/points.service';
import { CreateRefundDto } from './dto/create-refund.dto';

/** Statuses that allow a refund request */
const REFUNDABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PAID,
  OrderStatus.ORDERED_TO_YIWUGO,
  OrderStatus.YIWUGO_CONFIRMED,
  OrderStatus.PREPARING,
  OrderStatus.DELIVERED,
  OrderStatus.PURCHASE_CONFIRMED,
];

/** Stages where shipping fee is deducted from refund */
const SHIPPING_DEDUCTION_STATUSES: OrderStatus[] = [
  OrderStatus.SHIPPING_FROM_CHINA,
  OrderStatus.IN_TRANSIT,
  OrderStatus.IN_CUSTOMS,
  OrderStatus.CUSTOMS_CLEARED,
  OrderStatus.DOMESTIC_SHIPPING,
  OrderStatus.DELIVERED,
  OrderStatus.PURCHASE_CONFIRMED,
];

@Injectable()
export class RefundService {
  private readonly logger = new Logger(RefundService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly paymentService: PaymentService,
    private readonly couponService: CouponService,
    private readonly pointsService: PointsService,
  ) {}

  /**
   * Request a refund for an order
   */
  async requestRefund(userId: string, dto: CreateRefundDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('본인의 주문만 환불 요청할 수 있습니다.');
    }

    if (!REFUNDABLE_STATUSES.includes(order.status)) {
      throw new BadRequestException(
        `현재 주문 상태(${order.status})에서는 환불을 요청할 수 없습니다.`,
      );
    }

    // Check for existing pending refund
    const existingRefund = await this.prisma.refund.findFirst({
      where: {
        orderId: dto.orderId,
        status: { in: [RefundStatus.REQUESTED, RefundStatus.APPROVED] },
      },
    });
    if (existingRefund) {
      throw new BadRequestException('이미 진행 중인 환불 요청이 있습니다.');
    }

    // Calculate refund amount based on order stage
    let refundAmount = Number(order.totalKrw);

    if (SHIPPING_DEDUCTION_STATUSES.includes(order.status)) {
      // Deduct shipping fee if goods have already shipped
      refundAmount -= Number(order.shippingFeeKrw);
    }

    // Ensure refund is not negative
    if (refundAmount < 0) refundAmount = 0;

    const refund = await this.prisma.refund.create({
      data: {
        orderId: dto.orderId,
        reason: dto.reason,
        amount: refundAmount,
        images: dto.images ?? [],
        status: RefundStatus.REQUESTED,
      },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: dto.orderId },
      data: { status: OrderStatus.REFUND_REQUESTED },
    });

    this.eventEmitter.emit('order.status.changed', {
      orderId: dto.orderId,
      oldStatus: order.status,
      newStatus: OrderStatus.REFUND_REQUESTED,
    });

    this.logger.log(
      `Refund requested: orderId=${dto.orderId}, amount=${refundAmount}`,
    );

    return refund;
  }

  /**
   * Admin approves a refund request
   */
  async approveRefund(refundId: string, adminId: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: refundId },
      include: { order: { include: { payment: true } } },
    });

    if (!refund) {
      throw new NotFoundException('환불 요청을 찾을 수 없습니다.');
    }

    if (refund.status !== RefundStatus.REQUESTED) {
      throw new BadRequestException('대기 중인 환불 요청만 승인할 수 있습니다.');
    }

    await this.prisma.refund.update({
      where: { id: refundId },
      data: {
        status: RefundStatus.APPROVED,
        processedBy: adminId,
      },
    });

    // Process the actual PG refund
    return this.processRefund(refundId);
  }

  /**
   * Admin rejects a refund request
   */
  async rejectRefund(refundId: string, adminId: string, reason: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: refundId },
      include: { order: true },
    });

    if (!refund) {
      throw new NotFoundException('환불 요청을 찾을 수 없습니다.');
    }

    if (refund.status !== RefundStatus.REQUESTED) {
      throw new BadRequestException('대기 중인 환불 요청만 거절할 수 있습니다.');
    }

    const updated = await this.prisma.refund.update({
      where: { id: refundId },
      data: {
        status: RefundStatus.REJECTED,
        adminNote: reason,
        processedAt: new Date(),
        processedBy: adminId,
      },
    });

    // Revert order status back (to its previous status before REFUND_REQUESTED)
    // For simplicity, set back to the previous meaningful status
    // In practice you'd store the previous status
    if (refund.order.status === OrderStatus.REFUND_REQUESTED) {
      await this.prisma.order.update({
        where: { id: refund.orderId },
        data: { status: OrderStatus.DELIVERED },
      });
    }

    this.logger.log(`Refund rejected: refundId=${refundId}, by=${adminId}`);
    return updated;
  }

  /**
   * Process the actual PG refund, restore points/coupon
   */
  async processRefund(refundId: string) {
    const refund = await this.prisma.refund.findUnique({
      where: { id: refundId },
      include: {
        order: {
          include: { payment: true },
        },
      },
    });

    if (!refund) {
      throw new NotFoundException('환불 요청을 찾을 수 없습니다.');
    }

    const { order } = refund;

    // Process PG refund if payment exists and was approved
    if (order.payment && order.payment.status === PaymentStatus.APPROVED) {
      try {
        await this.paymentService.refundPayment(
          order.payment.id,
          Number(refund.amount),
          refund.reason,
        );
      } catch (error) {
        this.logger.error(
          `PG refund failed for refund ${refundId}`,
          error,
        );
        throw error;
      }
    }

    // Restore points if used
    if (order.pointsUsed > 0) {
      await this.pointsService.restorePoints(
        order.userId,
        order.pointsUsed,
        order.id,
      );
    }

    // Restore coupon if used
    if (order.couponId) {
      const userCoupon = await this.prisma.userCoupon.findFirst({
        where: { orderId: order.id },
      });
      if (userCoupon) {
        await this.couponService.restoreCoupon(userCoupon.id);
      }
    }

    // Update refund status
    const completed = await this.prisma.refund.update({
      where: { id: refundId },
      data: {
        status: RefundStatus.COMPLETED,
        processedAt: new Date(),
      },
    });

    // Update order status
    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.REFUNDED },
    });

    this.eventEmitter.emit('order.status.changed', {
      orderId: order.id,
      oldStatus: order.status,
      newStatus: OrderStatus.REFUNDED,
    });

    this.logger.log(`Refund completed: refundId=${refundId}`);
    return completed;
  }

  /**
   * Get refund info for an order
   */
  async getRefund(orderId: string) {
    return this.prisma.refund.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Admin: list all refund requests with filters
   */
  async getRefundList(params: {
    page?: number;
    pageSize?: number;
    status?: RefundStatus;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.refund.findMany({
        where,
        include: {
          order: {
            select: {
              orderNumber: true,
              userId: true,
              totalKrw: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.refund.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }
}
