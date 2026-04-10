import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CouponType } from '@prisma/client';
import { CreateCouponDto } from './dto/create-coupon.dto';

export interface CouponDiscountResult {
  couponId: string;
  couponName: string;
  type: CouponType;
  discountKrw: number;
}

@Injectable()
export class CouponService {
  private readonly logger = new Logger(CouponService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new coupon (admin)
   */
  async createCoupon(dto: CreateCouponDto) {
    const existing = await this.prisma.coupon.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException('이미 존재하는 쿠폰 코드입니다.');
    }

    return this.prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(),
        name: dto.name,
        description: dto.description,
        type: dto.type,
        value: dto.value,
        minOrderAmount: dto.minOrderAmount,
        maxDiscountAmount: dto.maxDiscountAmount,
        categoryId: dto.categoryId,
        totalQuantity: dto.totalQuantity,
        startsAt: new Date(dto.startsAt),
        expiresAt: new Date(dto.expiresAt),
      },
    });
  }

  /**
   * List all coupons (admin) with pagination
   */
  async getCoupons(params: { page?: number; pageSize?: number; isActive?: boolean }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const [items, total] = await Promise.all([
      this.prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.coupon.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Get user's available (unused, not expired) coupons
   */
  async getUserCoupons(userId: string) {
    const now = new Date();

    const userCoupons = await this.prisma.userCoupon.findMany({
      where: {
        userId,
        isUsed: false,
        expiresAt: { gt: now },
      },
      include: {
        coupon: true,
      },
      orderBy: { receivedAt: 'desc' },
    });

    return userCoupons.filter((uc) => uc.coupon.isActive);
  }

  /**
   * Issue a coupon to a user
   */
  async issueCoupon(userId: string, couponId: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id: couponId },
    });
    if (!coupon) {
      throw new NotFoundException('쿠폰을 찾을 수 없습니다.');
    }
    if (!coupon.isActive) {
      throw new BadRequestException('비활성화된 쿠폰입니다.');
    }

    const now = new Date();
    if (now < coupon.startsAt || now > coupon.expiresAt) {
      throw new BadRequestException('쿠폰 유효 기간이 아닙니다.');
    }

    if (coupon.totalQuantity !== null && coupon.usedQuantity >= coupon.totalQuantity) {
      throw new BadRequestException('쿠폰이 모두 소진되었습니다.');
    }

    // Check if user already has this coupon
    const existing = await this.prisma.userCoupon.findUnique({
      where: { userId_couponId: { userId, couponId } },
    });
    if (existing) {
      throw new ConflictException('이미 보유한 쿠폰입니다.');
    }

    return this.prisma.userCoupon.create({
      data: {
        userId,
        couponId,
        expiresAt: coupon.expiresAt,
      },
      include: { coupon: true },
    });
  }

  /**
   * Issue coupon by promo code
   */
  async issueByCode(userId: string, code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon) {
      throw new NotFoundException('유효하지 않은 쿠폰 코드입니다.');
    }

    return this.issueCoupon(userId, coupon.id);
  }

  /**
   * Validate coupon and calculate discount for a given order amount
   */
  async applyCoupon(
    userId: string,
    couponId: string,
    orderAmount: number,
    categoryId?: string,
  ): Promise<CouponDiscountResult> {
    const userCoupon = await this.prisma.userCoupon.findFirst({
      where: {
        userId,
        couponId,
        isUsed: false,
      },
      include: { coupon: true },
    });

    if (!userCoupon) {
      throw new NotFoundException('보유하지 않은 쿠폰이거나 이미 사용되었습니다.');
    }

    const { coupon } = userCoupon;
    const now = new Date();

    if (!coupon.isActive) {
      throw new BadRequestException('비활성화된 쿠폰입니다.');
    }
    if (now > userCoupon.expiresAt) {
      throw new BadRequestException('만료된 쿠폰입니다.');
    }
    if (
      coupon.minOrderAmount !== null &&
      orderAmount < Number(coupon.minOrderAmount)
    ) {
      throw new BadRequestException(
        `최소 주문 금액 ${Number(coupon.minOrderAmount).toLocaleString()}원 이상부터 사용 가능합니다.`,
      );
    }
    if (coupon.categoryId && categoryId && coupon.categoryId !== categoryId) {
      throw new BadRequestException('해당 카테고리에서 사용할 수 없는 쿠폰입니다.');
    }

    let discountKrw = 0;

    switch (coupon.type) {
      case CouponType.FIXED_AMOUNT:
        discountKrw = Number(coupon.value);
        break;
      case CouponType.PERCENTAGE:
        discountKrw = Math.floor(orderAmount * (Number(coupon.value) / 100));
        if (
          coupon.maxDiscountAmount !== null &&
          discountKrw > Number(coupon.maxDiscountAmount)
        ) {
          discountKrw = Number(coupon.maxDiscountAmount);
        }
        break;
      case CouponType.FREE_SHIPPING:
        // Shipping discount handled at order level; return 0 here
        discountKrw = 0;
        break;
    }

    // Discount cannot exceed order amount
    if (discountKrw > orderAmount) {
      discountKrw = orderAmount;
    }

    return {
      couponId: coupon.id,
      couponName: coupon.name,
      type: coupon.type,
      discountKrw,
    };
  }

  /**
   * Mark coupon as used for an order
   */
  async useCoupon(userId: string, couponId: string, orderId: string): Promise<void> {
    const userCoupon = await this.prisma.userCoupon.findFirst({
      where: {
        userId,
        couponId,
        isUsed: false,
      },
    });

    if (!userCoupon) {
      throw new BadRequestException('사용할 수 없는 쿠폰입니다.');
    }

    await this.prisma.$transaction([
      this.prisma.userCoupon.update({
        where: { id: userCoupon.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
          orderId,
        },
      }),
      this.prisma.coupon.update({
        where: { id: couponId },
        data: { usedQuantity: { increment: 1 } },
      }),
    ]);
  }

  /**
   * Restore coupon on refund (if not expired)
   */
  async restoreCoupon(userCouponId: string): Promise<void> {
    const userCoupon = await this.prisma.userCoupon.findUnique({
      where: { id: userCouponId },
      include: { coupon: true },
    });

    if (!userCoupon) return;

    const now = new Date();
    if (userCoupon.expiresAt <= now) {
      this.logger.log(
        `Coupon ${userCouponId} not restored — already expired`,
      );
      return;
    }

    await this.prisma.$transaction([
      this.prisma.userCoupon.update({
        where: { id: userCouponId },
        data: {
          isUsed: false,
          usedAt: null,
          orderId: null,
        },
      }),
      this.prisma.coupon.update({
        where: { id: userCoupon.couponId },
        data: { usedQuantity: { decrement: 1 } },
      }),
    ]);

    this.logger.log(`Coupon ${userCouponId} restored`);
  }

  /**
   * Deactivate a coupon (admin)
   */
  async deactivateCoupon(couponId: string): Promise<void> {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id: couponId },
    });
    if (!coupon) {
      throw new NotFoundException('쿠폰을 찾을 수 없습니다.');
    }

    await this.prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: false },
    });
  }
}
