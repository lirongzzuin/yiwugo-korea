import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@prisma/prisma.service';
import { UserActionType } from '@prisma/client';

/**
 * 사용자 선호도를 백그라운드에서 주기적으로 계산하는 서비스
 * - 스케줄러로 실행되므로 사용자 요청에 영향 없음
 * - 각 행동 유형에 가중치를 부여하여 카테고리별 선호도 점수 계산
 */

// 행동별 가중치 (높을수록 강한 관심 신호)
const ACTION_WEIGHTS: Record<UserActionType, number> = {
  VIEW: 1,
  CLICK: 2,
  SEARCH: 2,
  WISHLIST: 5,
  CART: 7,
  PURCHASE: 10,
};

// 시간 감쇠 (최근 행동에 더 높은 가중치)
const DECAY_DAYS = 30; // 30일 기준으로 감쇠

@Injectable()
export class PreferenceComputerService {
  private readonly logger = new Logger(PreferenceComputerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 매 시간 사용자 선호도를 재계산
   * - 최근 활동이 있는 사용자만 대상
   * - 배치로 처리하여 DB 부하 분산
   */
  @Cron(CronExpression.EVERY_HOUR)
  async computePreferences() {
    this.logger.log('Starting preference computation...');

    try {
      // 최근 1시간 내 활동이 있는 사용자 목록
      const cutoff = new Date(Date.now() - 60 * 60 * 1000);
      const activeUserIds = await this.prisma.userActivity.findMany({
        where: { createdAt: { gte: cutoff } },
        select: { userId: true },
        distinct: ['userId'],
      });

      const userIds = activeUserIds.map((u) => u.userId);
      if (userIds.length === 0) {
        this.logger.log('No active users to process');
        return;
      }

      this.logger.log(`Processing ${userIds.length} active users`);

      // 배치 처리 (한 번에 50명씩)
      for (let i = 0; i < userIds.length; i += 50) {
        const batch = userIds.slice(i, i + 50);
        await Promise.all(batch.map((uid) => this.computeForUser(uid)));
      }

      this.logger.log('Preference computation completed');
    } catch (error) {
      this.logger.error('Preference computation failed', error);
    }
  }

  /**
   * 특정 사용자의 선호도 계산
   */
  async computeForUser(userId: string) {
    try {
      // 최근 30일 활동 조회
      const since = new Date(Date.now() - DECAY_DAYS * 24 * 60 * 60 * 1000);
      const activities = await this.prisma.userActivity.findMany({
        where: { userId, createdAt: { gte: since } },
        select: {
          categoryId: true,
          productId: true,
          actionType: true,
          createdAt: true,
        },
      });

      if (activities.length === 0) return;

      // categoryId가 없는 활동에 대해 product에서 categoryId 가져오기
      const productIdsWithoutCategory = activities
        .filter((a) => !a.categoryId && a.productId)
        .map((a) => a.productId!);

      const productCategories = new Map<string, string>();
      if (productIdsWithoutCategory.length > 0) {
        const products = await this.prisma.product.findMany({
          where: { id: { in: [...new Set(productIdsWithoutCategory)] } },
          select: { id: true, categoryId: true },
        });
        products.forEach((p) => {
          if (p.categoryId) productCategories.set(p.id, p.categoryId);
        });
      }

      // 카테고리별 점수 계산
      const categoryScores: Record<string, number> = {};
      const now = Date.now();
      let priceSamples: number[] = [];

      for (const activity of activities) {
        const catId =
          activity.categoryId ||
          (activity.productId ? productCategories.get(activity.productId) : null);

        if (!catId) continue;

        const weight = ACTION_WEIGHTS[activity.actionType] || 1;
        const ageMs = now - activity.createdAt.getTime();
        const ageDays = ageMs / (24 * 60 * 60 * 1000);
        const decay = Math.max(0.1, 1 - ageDays / DECAY_DAYS);

        categoryScores[catId] = (categoryScores[catId] || 0) + weight * decay;
      }

      // 가장 많이 본 상품들의 가격대 분석
      const viewedProductIds = activities
        .filter((a) => a.productId)
        .map((a) => a.productId!)
        .filter((v, i, arr) => arr.indexOf(v) === i)
        .slice(0, 50);

      if (viewedProductIds.length > 0) {
        const products = await this.prisma.product.findMany({
          where: { id: { in: viewedProductIds } },
          select: { priceKrw: true },
        });
        priceSamples = products.map((p) => Number(p.priceKrw));
      }

      // 선호 가격대 계산 (하위 20% ~ 상위 80%)
      priceSamples.sort((a, b) => a - b);
      const priceLow = priceSamples.length > 0
        ? priceSamples[Math.floor(priceSamples.length * 0.2)]
        : null;
      const priceHigh = priceSamples.length > 0
        ? priceSamples[Math.floor(priceSamples.length * 0.8)]
        : null;

      // 자주 본 상점 추출 (상위 5개)
      const shopCounts: Record<string, number> = {};
      if (viewedProductIds.length > 0) {
        const prods = await this.prisma.product.findMany({
          where: { id: { in: viewedProductIds }, shopId: { not: null } },
          select: { shopId: true },
        });
        prods.forEach((p) => {
          if (p.shopId) shopCounts[p.shopId] = (shopCounts[p.shopId] || 0) + 1;
        });
      }
      const favoriteShopIds = Object.entries(shopCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      // Upsert 선호도
      await this.prisma.userPreference.upsert({
        where: { userId },
        create: {
          userId,
          categoryScores,
          priceRangeLow: priceLow,
          priceRangeHigh: priceHigh,
          favoriteShopIds,
          lastComputedAt: new Date(),
        },
        update: {
          categoryScores,
          priceRangeLow: priceLow,
          priceRangeHigh: priceHigh,
          favoriteShopIds,
          lastComputedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.warn(`Failed to compute preferences for user ${userId}: ${error}`);
    }
  }
}
