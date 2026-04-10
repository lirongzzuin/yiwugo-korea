import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a review. Validates user purchased the product and one review per order+product.
   */
  async createReview(userId: string, dto: CreateReviewDto) {
    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    // Validate user purchased this product (must have a PURCHASE_CONFIRMED or DELIVERED order)
    const orderItemWhere: any = {
      productId: dto.productId,
      order: {
        userId,
        status: { in: [OrderStatus.PURCHASE_CONFIRMED, OrderStatus.DELIVERED] },
      },
    };
    if (dto.orderId) {
      orderItemWhere.orderId = dto.orderId;
    }

    const orderItem = await this.prisma.orderItem.findFirst({
      where: orderItemWhere,
      include: { order: true },
    });

    if (!orderItem) {
      throw new BadRequestException(
        '구매 확정된 주문이 있어야 리뷰를 작성할 수 있습니다.',
      );
    }

    const orderId = dto.orderId || orderItem.orderId;

    // Check duplicate: one review per order+product
    const existing = await this.prisma.review.findUnique({
      where: {
        userId_productId_orderId: {
          userId,
          productId: dto.productId,
          orderId,
        },
      },
    });
    if (existing) {
      throw new ConflictException('이미 해당 주문의 상품에 대한 리뷰가 존재합니다.');
    }

    const review = await this.prisma.review.create({
      data: {
        userId,
        productId: dto.productId,
        orderId,
        rating: dto.rating,
        content: dto.content,
        images: dto.images ?? [],
        qualityGood: dto.qualityGood,
        deliveryGood: dto.deliveryGood,
        transAccurate: dto.transAccurate,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Update product rating cache
    await this.updateProductRatingCache(dto.productId);

    this.eventEmitter.emit('review.created', {
      reviewId: review.id,
      userId,
      productId: dto.productId,
    });

    this.logger.log(
      `Review created: product=${dto.productId}, user=${userId}, rating=${dto.rating}`,
    );

    return review;
  }

  /**
   * Get reviews for a product with pagination
   */
  async getProductReviews(productId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId, isVisible: true },
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.review.count({ where: { productId, isVisible: true } }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Get reviews written by a user
   */
  async getUserReviews(userId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              titleKo: true,
              imageUrls: true,
              priceKrw: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.review.count({ where: { userId } }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Get review statistics for a product
   */
  async getReviewStats(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId, isVisible: true },
      select: { rating: true },
    });

    const totalCount = reviews.length;
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    let sum = 0;
    for (const r of reviews) {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      sum += r.rating;
    }

    const averageRating = totalCount > 0 ? Math.round((sum / totalCount) * 10) / 10 : 0;

    return { averageRating, totalCount, distribution };
  }

  /**
   * Hide a review (admin action)
   */
  async hideReview(reviewId: string, reason: string, adminId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { isVisible: false },
    });

    // Recalculate product rating
    await this.updateProductRatingCache(review.productId);

    this.logger.log(
      `Review hidden: id=${reviewId}, reason=${reason}, admin=${adminId}`,
    );

    return updated;
  }

  /**
   * Update the averageRating and reviewCount on the Product model
   */
  async updateProductRatingCache(productId: string) {
    const stats = await this.getReviewStats(productId);

    await this.prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: stats.averageRating,
        reviewCount: stats.totalCount,
      },
    });
  }
}
