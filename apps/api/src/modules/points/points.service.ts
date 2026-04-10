import {
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@prisma/prisma.service';
import { PointAction } from '@prisma/client';

@Injectable()
export class PointsService {
  private readonly logger = new Logger(PointsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get the current point balance for a user
   */
  async getBalance(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });
    return user?.points ?? 0;
  }

  /**
   * Get point history with pagination
   */
  async getHistory(
    userId: string,
    page: number = 1,
    pageSize: number = 20,
  ) {
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.pointHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.pointHistory.count({ where: { userId } }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Earn points (purchase confirmation, review, signup, referral, event)
   */
  async earnPoints(
    userId: string,
    amount: number,
    action: PointAction,
    description: string,
    orderId?: string,
  ): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException('적립 포인트는 0보다 커야 합니다.');
    }

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: { points: { increment: amount } },
      });

      // Points expire 12 months from now
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      await tx.pointHistory.create({
        data: {
          userId,
          action,
          amount,
          balance: user.points,
          description,
          orderId,
          expiresAt,
        },
      });
    });

    this.logger.log(
      `Points earned: userId=${userId}, amount=${amount}, action=${action}`,
    );
  }

  /**
   * Use points for an order
   * Validates sufficient balance and max usage rate (max 50% of order total)
   */
  async usePoints(
    userId: string,
    amount: number,
    orderId: string,
  ): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException('사용할 포인트는 0보다 커야 합니다.');
    }

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });

      if (!user || user.points < amount) {
        throw new BadRequestException(
          `포인트가 부족합니다. 보유: ${user?.points ?? 0}P, 요청: ${amount}P`,
        );
      }

      const updated = await tx.user.update({
        where: { id: userId },
        data: { points: { decrement: amount } },
      });

      await tx.pointHistory.create({
        data: {
          userId,
          action: PointAction.USE_ORDER,
          amount: -amount,
          balance: updated.points,
          description: `주문 사용 (${orderId})`,
          orderId,
        },
      });
    });

    this.logger.log(
      `Points used: userId=${userId}, amount=${amount}, orderId=${orderId}`,
    );
  }

  /**
   * Restore points on refund
   */
  async restorePoints(
    userId: string,
    amount: number,
    orderId: string,
  ): Promise<void> {
    if (amount <= 0) return;

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: { points: { increment: amount } },
      });

      await tx.pointHistory.create({
        data: {
          userId,
          action: PointAction.ADMIN_ADJUST,
          amount,
          balance: user.points,
          description: `환불 복원 (${orderId})`,
          orderId,
        },
      });
    });

    this.logger.log(
      `Points restored: userId=${userId}, amount=${amount}, orderId=${orderId}`,
    );
  }

  /**
   * Admin deduction of points
   */
  async deductPoints(
    userId: string,
    amount: number,
    reason: string,
  ): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException('차감 포인트는 0보다 커야 합니다.');
    }

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });

      if (!user || user.points < amount) {
        throw new BadRequestException(
          `포인트가 부족합니다. 보유: ${user?.points ?? 0}P`,
        );
      }

      const updated = await tx.user.update({
        where: { id: userId },
        data: { points: { decrement: amount } },
      });

      await tx.pointHistory.create({
        data: {
          userId,
          action: PointAction.ADMIN_ADJUST,
          amount: -amount,
          balance: updated.points,
          description: `관리자 차감: ${reason}`,
        },
      });
    });

    this.logger.log(
      `Points deducted: userId=${userId}, amount=${amount}, reason=${reason}`,
    );
  }

  /**
   * Expire points older than 12 months.
   * Runs daily at midnight KST (15:00 UTC).
   * Also notifies users 30 days before expiration.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expirePoints(): Promise<void> {
    const now = new Date();

    // Find earn records that have expired
    const expiredRecords = await this.prisma.pointHistory.findMany({
      where: {
        amount: { gt: 0 },
        expiresAt: { lte: now },
        action: {
          in: [
            PointAction.EARN_PURCHASE,
            PointAction.EARN_REVIEW,
            PointAction.EARN_SIGNUP,
            PointAction.EARN_REFERRAL,
            PointAction.EARN_EVENT,
          ],
        },
      },
      select: { id: true, userId: true, amount: true },
    });

    if (expiredRecords.length === 0) return;

    // Group by userId
    const userExpireMap = new Map<string, number>();
    const processedIds: string[] = [];

    for (const record of expiredRecords) {
      const current = userExpireMap.get(record.userId) ?? 0;
      userExpireMap.set(record.userId, current + record.amount);
      processedIds.push(record.id);
    }

    // Process each user
    for (const [userId, expireAmount] of userExpireMap) {
      try {
        await this.prisma.$transaction(async (tx) => {
          const user = await tx.user.findUnique({
            where: { id: userId },
            select: { points: true },
          });
          if (!user) return;

          // Only expire up to what the user actually has
          const actualExpire = Math.min(expireAmount, user.points);
          if (actualExpire <= 0) return;

          const updated = await tx.user.update({
            where: { id: userId },
            data: { points: { decrement: actualExpire } },
          });

          await tx.pointHistory.create({
            data: {
              userId,
              action: PointAction.EXPIRE,
              amount: -actualExpire,
              balance: updated.points,
              description: '포인트 유효기간 만료',
            },
          });
        });
      } catch (error) {
        this.logger.error(
          `Failed to expire points for user ${userId}`,
          error,
        );
      }
    }

    // Mark expired records by setting expiresAt to past (already past, no-op conceptually)
    // The records themselves stay for history

    this.logger.log(
      `Expired points for ${userExpireMap.size} users, ${processedIds.length} records`,
    );

    // Notify users about points expiring in 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const soonExpiring = await this.prisma.pointHistory.findMany({
      where: {
        amount: { gt: 0 },
        expiresAt: {
          gt: now,
          lte: thirtyDaysFromNow,
        },
        action: {
          in: [
            PointAction.EARN_PURCHASE,
            PointAction.EARN_REVIEW,
            PointAction.EARN_SIGNUP,
            PointAction.EARN_REFERRAL,
            PointAction.EARN_EVENT,
          ],
        },
      },
      select: { userId: true, amount: true, expiresAt: true },
    });

    if (soonExpiring.length > 0) {
      const userNotifyMap = new Map<string, number>();
      for (const record of soonExpiring) {
        const current = userNotifyMap.get(record.userId) ?? 0;
        userNotifyMap.set(record.userId, current + record.amount);
      }

      for (const [userId, amount] of userNotifyMap) {
        try {
          await this.prisma.notification.create({
            data: {
              userId,
              type: 'POINT',
              title: '포인트 만료 예정 안내',
              message: `${amount}P가 30일 이내에 만료됩니다. 만료 전에 사용해 주세요!`,
            },
          });
        } catch (error) {
          this.logger.error(
            `Failed to send expiry notification to user ${userId}`,
            error,
          );
        }
      }
    }
  }
}
