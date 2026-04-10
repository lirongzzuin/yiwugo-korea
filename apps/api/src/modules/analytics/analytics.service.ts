import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardKPI(period: 'today' | 'week' | 'month') {
    const now = new Date();
    let startDate: Date;

    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const [totalSales, orderCount, newUsers, activeOrders] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: { notIn: ['CANCELLED', 'REFUNDED'] },
        },
        _sum: { totalKrw: true },
      }),
      this.prisma.order.count({
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      this.prisma.order.count({
        where: {
          status: {
            in: [
              'PAID',
              'ORDERED_TO_YIWUGO',
              'YIWUGO_CONFIRMED',
              'PREPARING',
              'SHIPPING_FROM_CHINA',
              'IN_TRANSIT',
              'IN_CUSTOMS',
            ],
          },
        },
      }),
    ]);

    return {
      totalSales: totalSales._sum.totalKrw?.toString() || '0',
      orderCount,
      newUsers,
      activeOrders,
      period,
    };
  }

  async getSalesChart(period: 'daily' | 'weekly' | 'monthly', days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { notIn: ['CANCELLED', 'REFUNDED'] },
      },
      select: { createdAt: true, totalKrw: true },
      orderBy: { createdAt: 'asc' },
    });

    const grouped: Record<string, number> = {};
    for (const order of orders) {
      const key = order.createdAt.toISOString().split('T')[0];
      grouped[key] = (grouped[key] || 0) + Number(order.totalKrw);
    }

    return Object.entries(grouped).map(([date, amount]) => ({ date, amount }));
  }

  async getTopProducts(limit = 20) {
    return this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { salesCount: 'desc' },
      take: limit,
      select: {
        id: true,
        titleKo: true,
        priceKrw: true,
        salesCount: true,
        imageUrls: true,
      },
    });
  }

  async getCustomerStats() {
    const [total, individual, business] = await Promise.all([
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({
        where: { isActive: true, memberType: 'INDIVIDUAL' },
      }),
      this.prisma.user.count({
        where: { isActive: true, memberType: 'BUSINESS' },
      }),
    ]);

    return {
      total,
      individual,
      business,
      businessRatio:
        total > 0 ? ((business / total) * 100).toFixed(1) : '0',
    };
  }
}
