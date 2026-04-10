import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class DataExportService {
  constructor(private prisma: PrismaService) {}

  async exportOrders(
    startDate: Date,
    endDate: Date,
    status?: OrderStatus,
  ): Promise<string> {
    const where: any = {
      createdAt: { gte: startDate, lte: endDate },
    };
    if (status) where.status = status;

    const orders = await this.prisma.order.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const header = 'orderNumber,userName,userEmail,totalKrw,status,createdAt';
    const rows = orders.map((order) => {
      const userName = (order.user?.name || '').replace(/,/g, ' ');
      const userEmail = order.user?.email || '';
      return [
        order.orderNumber,
        userName,
        userEmail,
        order.totalKrw.toString(),
        order.status,
        order.createdAt.toISOString(),
      ].join(',');
    });

    return [header, ...rows].join('\n');
  }

  async exportUsers(): Promise<string> {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        memberType: true,
        createdAt: true,
      },
    });

    const header = 'id,email,name,memberType,createdAt';
    const rows = users.map((user) => {
      const name = (user.name || '').replace(/,/g, ' ');
      return [
        user.id,
        user.email || '',
        name,
        user.memberType,
        user.createdAt.toISOString(),
      ].join(',');
    });

    return [header, ...rows].join('\n');
  }
}
