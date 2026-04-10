import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getChatRooms(userId: string) {
    return this.prisma.chatRoom.findMany({
      where: { userId },
      orderBy: { lastAt: 'desc' },
    });
  }

  async getMessages(chatRoomId: string, page = 1, pageSize = 30) {
    const [items, total] = await Promise.all([
      this.prisma.chatMessage.findMany({
        where: { chatRoomId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.chatMessage.count({ where: { chatRoomId } }),
    ]);

    return { items: items.reverse(), total, page, pageSize };
  }

  async createRoom(userId: string, shopId: string, shopName: string) {
    const existing = await this.prisma.chatRoom.findUnique({
      where: { userId_shopId: { userId, shopId } },
    });

    if (existing) return existing;

    return this.prisma.chatRoom.create({
      data: { userId, shopId, shopName },
    });
  }

  async sendMessage(
    chatRoomId: string,
    senderId: string,
    senderType: string,
    content: string,
    imageUrl?: string,
    productId?: string,
  ) {
    const message = await this.prisma.chatMessage.create({
      data: { chatRoomId, senderId, senderType, content, imageUrl, productId },
    });

    await this.prisma.chatRoom.update({
      where: { id: chatRoomId },
      data: { lastMessage: content, lastAt: new Date() },
    });

    return message;
  }

  async markAsRead(chatRoomId: string, userId: string) {
    await this.prisma.chatMessage.updateMany({
      where: { chatRoomId, senderId: { not: userId }, isRead: false },
      data: { isRead: true },
    });
  }
}
