import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma } from '@prisma/client';

/**
 * 개인화 추천 서비스
 * - 사용자 선호도 기반 맞춤 상품 추천
 * - 다양한 추천 전략 지원
 */
@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 사용자 맞춤 추천 상품 조회
   * 전략: 선호 카테고리 + 가격대 + 인기도 복합 점수
   */
  async getPersonalizedRecommendations(
    userId: string,
    limit = 20,
    excludeProductIds: string[] = [],
  ) {
    // 1. 사용자 선호도 조회
    const preference = await this.prisma.userPreference.findUnique({
      where: { userId },
    });

    // 선호도 데이터 없으면 인기 상품 반환
    if (!preference) {
      return this.getPopularProducts(limit, excludeProductIds);
    }

    const categoryScores = preference.categoryScores as Record<string, number>;
    const topCategories = Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id]) => id);

    if (topCategories.length === 0) {
      return this.getPopularProducts(limit, excludeProductIds);
    }

    // 2. 선호 카테고리 상품 조회 (가격대 필터 포함)
    const where: Prisma.ProductWhereInput = {
      isActive: true,
      categoryId: { in: topCategories },
      ...(excludeProductIds.length > 0
        ? { id: { notIn: excludeProductIds } }
        : {}),
    };

    // 가격대 필터 (선호도가 있는 경우)
    if (preference.priceRangeLow && preference.priceRangeHigh) {
      where.priceKrw = {
        gte: preference.priceRangeLow,
        lte: new Prisma.Decimal(
          Number(preference.priceRangeHigh) * 1.5, // 상한은 약간 넓게
        ),
      };
    }

    const products = await this.prisma.product.findMany({
      where,
      orderBy: [
        { salesCount: 'desc' },
        { viewCount: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      select: {
        id: true,
        titleKo: true,
        priceKrw: true,
        originalPriceKrw: true,
        imageUrls: true,
        imageProxyUrls: true,
        salesCount: true,
        reviewCount: true,
        averageRating: true,
        categoryId: true,
        shopId: true,
        shop: { select: { nameKo: true } },
      },
    });

    // 3. 카테고리 가중치로 정렬 (DB 정렬 후 재정렬)
    const sorted = products.sort((a, b) => {
      const scoreA = categoryScores[a.categoryId || ''] || 0;
      const scoreB = categoryScores[b.categoryId || ''] || 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return (b.salesCount || 0) - (a.salesCount || 0);
    });

    return sorted;
  }

  /**
   * "이 상품과 비슷한 상품" 추천
   * 같은 카테고리 + 비슷한 가격대
   */
  async getSimilarProducts(
    productId: string,
    limit = 10,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true, priceKrw: true, shopId: true },
    });

    if (!product) return [];

    const priceRange = Number(product.priceKrw) * 0.5;
    const priceLow = Number(product.priceKrw) - priceRange;
    const priceHigh = Number(product.priceKrw) + priceRange;

    return this.prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: productId },
        categoryId: product.categoryId,
        priceKrw: {
          gte: new Prisma.Decimal(Math.max(0, priceLow)),
          lte: new Prisma.Decimal(priceHigh),
        },
      },
      orderBy: [{ salesCount: 'desc' }, { viewCount: 'desc' }],
      take: limit,
      select: {
        id: true,
        titleKo: true,
        priceKrw: true,
        originalPriceKrw: true,
        imageUrls: true,
        imageProxyUrls: true,
        salesCount: true,
        reviewCount: true,
        averageRating: true,
        shop: { select: { nameKo: true } },
      },
    });
  }

  /**
   * "이 상품을 본 사용자가 함께 본 상품" (협업 필터링)
   */
  async getAlsoBoughtProducts(productId: string, limit = 10) {
    // 이 상품을 구매한 사용자들이 구매한 다른 상품
    const buyers = await this.prisma.userActivity.findMany({
      where: { productId, actionType: 'PURCHASE' },
      select: { userId: true },
      distinct: ['userId'],
      take: 100,
    });

    if (buyers.length === 0) {
      return this.getSimilarProducts(productId, limit);
    }

    const buyerIds = buyers.map((b) => b.userId);

    // 해당 사용자들이 구매한 다른 상품
    const otherProducts = await this.prisma.userActivity.groupBy({
      by: ['productId'],
      where: {
        userId: { in: buyerIds },
        actionType: 'PURCHASE',
        productId: { not: productId },
      },
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: limit,
    });

    const productIds = otherProducts
      .map((p) => p.productId)
      .filter((id): id is string => id !== null);

    if (productIds.length === 0) {
      return this.getSimilarProducts(productId, limit);
    }

    return this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: {
        id: true,
        titleKo: true,
        priceKrw: true,
        originalPriceKrw: true,
        imageUrls: true,
        imageProxyUrls: true,
        salesCount: true,
        reviewCount: true,
        averageRating: true,
        shop: { select: { nameKo: true } },
      },
    });
  }

  /**
   * 인기 상품 (추천 데이터 없는 경우의 fallback)
   */
  private async getPopularProducts(
    limit: number,
    excludeProductIds: string[] = [],
  ) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        ...(excludeProductIds.length > 0
          ? { id: { notIn: excludeProductIds } }
          : {}),
      },
      orderBy: [{ salesCount: 'desc' }, { viewCount: 'desc' }],
      take: limit,
      select: {
        id: true,
        titleKo: true,
        priceKrw: true,
        originalPriceKrw: true,
        imageUrls: true,
        imageProxyUrls: true,
        salesCount: true,
        reviewCount: true,
        averageRating: true,
        categoryId: true,
        shop: { select: { nameKo: true } },
      },
    });
  }

  /**
   * 사용자 선호도 프로필 조회 (디버그/관리자용)
   */
  async getUserProfile(userId: string) {
    const preference = await this.prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!preference) return null;

    const categoryScores = preference.categoryScores as Record<string, number>;
    const topCategoryIds = Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    const categories = await this.prisma.category.findMany({
      where: { id: { in: topCategoryIds } },
      select: { id: true, nameKo: true },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c.nameKo]));

    return {
      userId,
      topCategories: topCategoryIds.map((id) => ({
        id,
        name: categoryMap.get(id) || id,
        score: Math.round(categoryScores[id] * 100) / 100,
      })),
      priceRange: {
        low: preference.priceRangeLow ? Number(preference.priceRangeLow) : null,
        high: preference.priceRangeHigh ? Number(preference.priceRangeHigh) : null,
      },
      favoriteShopIds: preference.favoriteShopIds,
      lastComputedAt: preference.lastComputedAt,
    };
  }
}
