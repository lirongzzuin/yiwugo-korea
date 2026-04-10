import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { KakaoAlimTalkProvider } from './providers/kakao-alimtalk.provider';
import { EmailProvider } from './providers/email.provider';
import { PushProvider } from './providers/push.provider';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'KAKAO' | 'PUSH';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly kakaoProvider: KakaoAlimTalkProvider,
    private readonly emailProvider: EmailProvider,
    private readonly pushProvider: PushProvider,
  ) {}

  /**
   * Create an in-app notification
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, any>,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message: body,
        data: data ?? undefined,
        linkUrl: data?.linkUrl,
        imageUrl: data?.imageUrl,
      },
    });

    this.logger.log(
      `Notification created: user=${userId}, type=${type}, title=${title}`,
    );

    return notification;
  }

  /**
   * Get paginated notifications for a user
   */
  async getNotifications(userId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return { items, total, page, pageSize };
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { updatedCount: result.count };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * Send notification via specified channel
   * Creates in-app notification and dispatches to the appropriate provider
   */
  async sendNotification(
    userId: string,
    channel: NotificationChannel,
    type: NotificationType,
    title: string,
    body: string,
    data?: Record<string, any>,
  ) {
    // Always create in-app notification
    const notification = await this.createNotification(userId, type, title, body, data);

    // Dispatch to external channel
    if (channel === 'EMAIL' || channel === 'KAKAO' || channel === 'PUSH') {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, phone: true },
      });

      if (!user) {
        this.logger.warn(`User ${userId} not found for notification dispatch`);
        return notification;
      }

      try {
        switch (channel) {
          case 'EMAIL':
            if (user.email) {
              await this.emailProvider.send({
                to: user.email,
                subject: title,
                html: `<div><h3>${title}</h3><p>${body}</p></div>`,
              });
            }
            break;

          case 'KAKAO':
            if (user.phone) {
              await this.kakaoProvider.send({
                phoneNumber: user.phone,
                templateCode: type,
                variables: { title, body, ...(data || {}) },
              });
            }
            break;

          case 'PUSH':
            // Push token would need to be stored on User model
            // For now, log the attempt
            this.logger.log(`[STUB] Push notification to user ${userId}`);
            break;
        }
      } catch (error) {
        this.logger.error(
          `Failed to dispatch ${channel} notification to user ${userId}`,
          error,
        );
      }
    }

    return notification;
  }
}
