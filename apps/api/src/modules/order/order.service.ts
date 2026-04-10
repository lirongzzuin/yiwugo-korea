import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@prisma/prisma.service';
import { OrderStatus, PointAction } from '@prisma/client';
import { ExchangeRateService } from '@modules/exchange-rate/exchange-rate.service';
import { CartService } from '@modules/cart/cart.service';
import { CouponService } from '@modules/coupon/coupon.service';
import { PointsService } from '@modules/points/points.service';
import { PaymentService } from '@modules/payment/payment.service';
import { CreateOrderDto } from './dto/create-order.dto';

/** Commission rate (platform fee) */
const COMMISSION_RATE = 0.05; // 5%

/** Points awarded on purchase confirmation: 1% of total */
const POINTS_RATE = 0.01;

/** Auto-confirm threshold in days after DELIVERED */
const AUTO_CONFIRM_DAYS = 7;

/** Valid status transitions */
const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [
    OrderStatus.ORDERED_TO_YIWUGO,
    OrderStatus.CANCELLED,
    OrderStatus.REFUND_REQUESTED,
  ],
  [OrderStatus.ORDERED_TO_YIWUGO]: [
    OrderStatus.YIWUGO_CONFIRMED,
    OrderStatus.CANCELLED,
    OrderStatus.REFUND_REQUESTED,
  ],
  [OrderStatus.YIWUGO_CONFIRMED]: [
    OrderStatus.PREPARING,
    OrderStatus.REFUND_REQUESTED,
  ],
  [OrderStatus.PREPARING]: [
    OrderStatus.SHIPPING_FROM_CHINA,
    OrderStatus.REFUND_REQUESTED,
  ],
  [OrderStatus.SHIPPING_FROM_CHINA]: [OrderStatus.IN_TRANSIT],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.IN_CUSTOMS],
  [OrderStatus.IN_CUSTOMS]: [OrderStatus.CUSTOMS_CLEARED],
  [OrderStatus.CUSTOMS_CLEARED]: [OrderStatus.DOMESTIC_SHIPPING],
  [OrderStatus.DOMESTIC_SHIPPING]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [
    OrderStatus.PURCHASE_CONFIRMED,
    OrderStatus.REFUND_REQUESTED,
  ],
  [OrderStatus.PURCHASE_CONFIRMED]: [OrderStatus.REFUND_REQUESTED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUND_REQUESTED]: [OrderStatus.REFUNDED, OrderStatus.DELIVERED],
  [OrderStatus.REFUNDED]: [],
};

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly exchangeRateService: ExchangeRateService,
    private readonly cartService: CartService,
    private readonly couponService: CouponService,
    private readonly pointsService: PointsService,
    private readonly paymentService: PaymentService,
  ) {}

  /**
   * Create a new order from the user's cart
   */
  async createOrder(userId: string, dto: CreateOrderDto) {
    // 1. Get cart items
    const cart = await this.cartService.getCart(userId);
    const allItems = cart.flatMap((group) => group.items);

    if (allItems.length === 0) {
      throw new BadRequestException('장바구니가 비어 있습니다.');
    }

    // 2. Validate shipping address
    const address = await this.prisma.address.findFirst({
      where: { id: dto.shippingAddressId, userId },
    });
    if (!address) {
      throw new NotFoundException('배송지를 찾을 수 없습니다.');
    }

    // 3. Get current exchange rate and snapshot it
    const rateResult = await this.exchangeRateService.getCurrentRate();
    const exchangeRate = rateResult.rate;

    // 4. Calculate item totals
    let itemsTotalKrw = 0;
    let itemsTotalCny = 0;

    for (const item of allItems) {
      itemsTotalKrw += Number(item.priceKrw) * item.quantity;
      itemsTotalCny += Number(item.priceCny) * item.quantity;
    }

    // 5. Calculate shipping fee (simplified — using ShippingService would need weight data)
    // For now, a basic flat-rate estimate
    const shippingFeeKrw =
      dto.shippingMethod === 'AIR'
        ? Math.max(15000, Math.round(itemsTotalCny * exchangeRate * 0.05))
        : Math.max(25000, Math.round(itemsTotalCny * exchangeRate * 0.03));

    // 6. Apply coupon if provided
    let discountKrw = 0;
    let isFreeShipping = false;

    if (dto.couponId) {
      const couponResult = await this.couponService.applyCoupon(
        userId,
        dto.couponId,
        itemsTotalKrw,
      );
      if (couponResult.type === 'FREE_SHIPPING') {
        isFreeShipping = true;
      } else {
        discountKrw = couponResult.discountKrw;
      }
    }

    // 7. Calculate points discount
    let pointsUsed = 0;
    if (dto.pointsToUse && dto.pointsToUse > 0) {
      // Max 50% of order amount
      const maxPointsUsable = Math.floor(itemsTotalKrw * 0.5);
      pointsUsed = Math.min(dto.pointsToUse, maxPointsUsable);
    }

    // 8. Calculate totals
    const effectiveShipping = isFreeShipping ? 0 : shippingFeeKrw;
    const commissionKrw = Math.round(itemsTotalKrw * COMMISSION_RATE);
    const totalKrw =
      itemsTotalKrw + effectiveShipping - discountKrw - pointsUsed + commissionKrw;

    // 9. Generate order number: YK + yyyyMMdd + 3-digit sequence
    const orderNumber = await this.generateOrderNumber();

    // 10. Create order + items in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: OrderStatus.PENDING,
          totalKrw,
          totalCny: itemsTotalCny,
          shippingFeeKrw: effectiveShipping,
          discountKrw,
          pointsUsed,
          commissionKrw,
          exchangeRate,
          commissionRate: COMMISSION_RATE,
          shippingAddressId: dto.shippingAddressId,
          customsCode: dto.customsCode,
          shippingMethod: dto.shippingMethod,
          couponId: dto.couponId,
          deliveryMemo: dto.deliveryMemo,
          items: {
            create: allItems.map((item) => ({
              productId: item.productId,
              productName: item.titleKo,
              quantity: item.quantity,
              priceKrw: Number(item.priceKrw),
              priceCny: Number(item.priceCny),
              options: item.options,
              imageUrl: item.imageUrl,
            })),
          },
        },
        include: { items: true },
      });

      // Create initial status history
      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          status: OrderStatus.PENDING,
          note: '주문 생성',
        },
      });

      return newOrder;
    });

    // 11. Use coupon if provided
    if (dto.couponId) {
      await this.couponService.useCoupon(userId, dto.couponId, order.id);
    }

    // 12. Deduct points if used
    if (pointsUsed > 0) {
      await this.pointsService.usePoints(userId, pointsUsed, order.id);
    }

    // 13. Clear cart
    await this.cartService.clearCart(userId);

    // 14. Initiate payment
    const paymentResult = await this.paymentService.initiatePayment(
      order.id,
      dto.paymentProvider,
    );

    // 15. Emit event
    this.eventEmitter.emit('order.created', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId,
    });

    this.logger.log(
      `Order created: ${orderNumber}, userId=${userId}, total=${totalKrw}`,
    );

    return {
      order,
      payment: paymentResult,
    };
  }

  /**
   * Get paginated order list with filters
   */
  async getOrders(
    userId: string,
    params: {
      page?: number;
      pageSize?: number;
      status?: OrderStatus;
      startDate?: string;
      endDate?: string;
    },
  ) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: any = { userId };

    if (params.status) {
      where.status = params.status;
    }
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          payment: { select: { status: true, method: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Get full order detail
   */
  async getOrderDetail(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payment: true,
        refunds: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        shippingAddress: true,
      },
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('본인의 주문만 조회할 수 있습니다.');
    }

    return order;
  }

  /**
   * Update order status (admin). Validates transition.
   */
  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    adminId?: string,
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    const allowedTransitions = ORDER_STATUS_FLOW[order.status];
    if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `${order.status} → ${newStatus} 상태 전환은 허용되지 않습니다.`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: newStatus,
          changedBy: adminId,
        },
      });

      return updatedOrder;
    });

    this.eventEmitter.emit('order.status.changed', {
      orderId,
      oldStatus: order.status,
      newStatus,
      adminId,
    });

    this.logger.log(
      `Order status updated: ${order.orderNumber} ${order.status} → ${newStatus}`,
    );

    return updated;
  }

  /**
   * Cancel an order (user). Only if PENDING or PAID.
   */
  async cancelOrder(userId: string, orderId: string, reason: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('본인의 주문만 취소할 수 있습니다.');
    }

    if (
      order.status !== OrderStatus.PENDING &&
      order.status !== OrderStatus.PAID
    ) {
      throw new BadRequestException(
        `현재 상태(${order.status})에서는 주문을 취소할 수 없습니다. 환불을 요청해 주세요.`,
      );
    }

    // If PAID, cancel payment
    if (
      order.status === OrderStatus.PAID &&
      order.payment
    ) {
      await this.paymentService.cancelPayment(order.payment.id, reason);
    }

    // Restore points
    if (order.pointsUsed > 0) {
      await this.pointsService.restorePoints(userId, order.pointsUsed, orderId);
    }

    // Restore coupon
    if (order.couponId) {
      const userCoupon = await this.prisma.userCoupon.findFirst({
        where: { orderId },
      });
      if (userCoupon) {
        await this.couponService.restoreCoupon(userCoupon.id);
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.CANCELLED,
          cancelReason: reason,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.CANCELLED,
          note: reason,
          changedBy: userId,
        },
      });

      return updatedOrder;
    });

    this.eventEmitter.emit('order.status.changed', {
      orderId,
      oldStatus: order.status,
      newStatus: OrderStatus.CANCELLED,
    });

    this.logger.log(`Order cancelled: ${order.orderNumber}`);
    return updated;
  }

  /**
   * Confirm purchase (user). Awards points.
   */
  async confirmPurchase(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    if (order.userId !== userId) {
      throw new BadRequestException('본인의 주문만 구매 확정할 수 있습니다.');
    }

    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('배송 완료된 주문만 구매 확정할 수 있습니다.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PURCHASE_CONFIRMED,
          purchaseConfirmedAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          status: OrderStatus.PURCHASE_CONFIRMED,
          changedBy: userId,
          note: '구매 확정',
        },
      });

      return updatedOrder;
    });

    // Award points (1% of total)
    const pointsToAward = Math.floor(Number(order.totalKrw) * POINTS_RATE);
    if (pointsToAward > 0) {
      await this.pointsService.earnPoints(
        userId,
        pointsToAward,
        PointAction.EARN_PURCHASE,
        `주문 ${order.orderNumber} 구매 확정 적립`,
        orderId,
      );
    }

    this.eventEmitter.emit('order.status.changed', {
      orderId,
      oldStatus: OrderStatus.DELIVERED,
      newStatus: OrderStatus.PURCHASE_CONFIRMED,
    });

    this.logger.log(`Purchase confirmed: ${order.orderNumber}`);
    return updated;
  }

  /**
   * Auto-confirm orders that have been DELIVERED for 7+ days.
   * Runs daily.
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async autoConfirmPurchase() {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - AUTO_CONFIRM_DAYS);

    const orders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.DELIVERED,
        updatedAt: { lte: threshold },
      },
    });

    this.logger.log(`Auto-confirming ${orders.length} orders`);

    for (const order of orders) {
      try {
        await this.confirmPurchase(order.userId, order.id);
      } catch (error) {
        this.logger.error(
          `Failed to auto-confirm order ${order.orderNumber}`,
          error,
        );
      }
    }
  }

  /**
   * Get order count by status for a user
   */
  async getOrderStats(userId: string) {
    const counts = await this.prisma.order.groupBy({
      by: ['status'],
      where: { userId },
      _count: { id: true },
    });

    const stats: Record<string, number> = {};
    for (const c of counts) {
      stats[c.status] = c._count.id;
    }
    return stats;
  }

  /**
   * Admin: get all orders with filters
   */
  async getAdminOrders(params: {
    page?: number;
    pageSize?: number;
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
    search?: string;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = new Date(params.startDate);
      if (params.endDate) where.createdAt.lte = new Date(params.endDate);
    }
    if (params.search) {
      where.OR = [
        { orderNumber: { contains: params.search, mode: 'insensitive' } },
        { user: { name: { contains: params.search, mode: 'insensitive' } } },
        { user: { email: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          payment: { select: { status: true, method: true, provider: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Generate unique order number: YK + yyyyMMdd + 3-digit sequence
   */
  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const dateStr = `${y}${m}${d}`;
    const prefix = `YK${dateStr}`;

    // Count orders created today to get sequence
    const startOfDay = new Date(y, now.getMonth(), now.getDate());
    const endOfDay = new Date(y, now.getMonth(), now.getDate() + 1);

    const todayCount = await this.prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const seq = String(todayCount + 1).padStart(3, '0');
    return `${prefix}${seq}`;
  }
}
