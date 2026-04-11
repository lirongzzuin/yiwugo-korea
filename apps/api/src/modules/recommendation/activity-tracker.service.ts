import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '@prisma/prisma.service';
import { UserActionType } from '@prisma/client';

/**
 * 사용자 행동을 비동기로 기록하는 서비스
 * - 모든 기록은 fire-and-forget 방식으로 메인 요청 속도에 영향 없음
 * - EventEmitter 이벤트를 구독하여 다른 모듈과 느슨한 결합
 */
@Injectable()
export class ActivityTrackerService {
  private readonly logger = new Logger(ActivityTrackerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 행동 기록 (비동기, fire-and-forget)
   */
  async track(
    userId: string,
    actionType: UserActionType,
    productId?: string,
    categoryId?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      await this.prisma.userActivity.create({
        data: {
          userId,
          actionType,
          productId,
          categoryId,
          metadata: metadata ?? undefined,
        },
      });
    } catch (error) {
      // 기록 실패가 서비스에 영향을 주면 안 됨
      this.logger.warn(`Activity tracking failed: ${error}`);
    }
  }

  // ─── 이벤트 리스너 (다른 모듈에서 emit하면 자동 기록) ───

  @OnEvent('product.viewed', { async: true })
  async onProductViewed(payload: {
    userId: string;
    productId: string;
    categoryId?: string;
  }) {
    await this.track(
      payload.userId,
      UserActionType.VIEW,
      payload.productId,
      payload.categoryId,
    );
  }

  @OnEvent('product.clicked', { async: true })
  async onProductClicked(payload: {
    userId: string;
    productId: string;
    categoryId?: string;
  }) {
    await this.track(
      payload.userId,
      UserActionType.CLICK,
      payload.productId,
      payload.categoryId,
    );
  }

  @OnEvent('wishlist.added', { async: true })
  async onWishlistAdded(payload: {
    userId: string;
    productId: string;
    categoryId?: string;
  }) {
    await this.track(
      payload.userId,
      UserActionType.WISHLIST,
      payload.productId,
      payload.categoryId,
    );
  }

  @OnEvent('cart.added', { async: true })
  async onCartAdded(payload: {
    userId: string;
    productId: string;
    categoryId?: string;
  }) {
    await this.track(
      payload.userId,
      UserActionType.CART,
      payload.productId,
      payload.categoryId,
    );
  }

  @OnEvent('order.paid', { async: true })
  async onOrderPaid(payload: {
    userId: string;
    items: Array<{ productId: string; categoryId?: string }>;
  }) {
    for (const item of payload.items) {
      await this.track(
        payload.userId,
        UserActionType.PURCHASE,
        item.productId,
        item.categoryId,
      );
    }
  }

  @OnEvent('search.performed', { async: true })
  async onSearchPerformed(payload: {
    userId: string;
    query: string;
    categoryId?: string;
  }) {
    await this.track(
      payload.userId,
      UserActionType.SEARCH,
      undefined,
      payload.categoryId,
      { query: payload.query },
    );
  }
}
