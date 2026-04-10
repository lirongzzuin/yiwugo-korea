import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(private prisma: PrismaService) {}

  async generateSettlement(periodStart: Date, periodEnd: Date) {
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: periodStart, lte: periodEnd },
        status: { in: ['PURCHASE_CONFIRMED', 'DELIVERED'] },
      },
      include: { payment: true, refunds: true },
    });

    let totalOrderAmountKrw = 0;
    let totalOrderAmountCny = 0;
    let totalCommissionKrw = 0;
    let totalShippingCny = 0;
    let totalExchangeRate = 0;
    let totalRefunds = 0;
    let totalPgFees = 0;

    for (const order of orders) {
      totalOrderAmountKrw += Number(order.totalKrw);
      totalOrderAmountCny += Number(order.totalCny);
      totalCommissionKrw += Number(order.commissionKrw);
      totalExchangeRate += Number(order.exchangeRate);

      // Sum completed refunds
      for (const refund of order.refunds) {
        if (refund.status === 'COMPLETED') {
          totalRefunds += Number(refund.amount);
        }
      }

      // Estimate PG fees at 3.3%
      if (order.payment?.status === 'APPROVED') {
        totalPgFees += Number(order.payment.amount) * 0.033;
      }
    }

    const avgExchangeRate =
      orders.length > 0 ? totalExchangeRate / orders.length : 190;

    // settlementAmountCny = amount to remit to Yiwugo suppliers in CNY
    const settlementAmountCny =
      totalOrderAmountCny - totalRefunds / avgExchangeRate;

    const orderIds = orders.map((o) => o.id);

    return this.prisma.settlement.create({
      data: {
        periodStart,
        periodEnd,
        orderIds,
        totalOrderAmountKrw: Math.round(totalOrderAmountKrw),
        totalOrderAmountCny: parseFloat(totalOrderAmountCny.toFixed(2)),
        totalCommissionKrw: Math.round(totalCommissionKrw),
        totalShippingCny: parseFloat(totalShippingCny.toFixed(2)),
        exchangeRateUsed: parseFloat(avgExchangeRate.toFixed(4)),
        settlementAmountCny: parseFloat(
          Math.max(0, settlementAmountCny).toFixed(2),
        ),
      },
    });
  }

  async confirmSettlement(id: string, adminId: string) {
    return this.prisma.settlement.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmedAt: new Date(),
        adminNote: `Confirmed by admin ${adminId}`,
      },
    });
  }

  async getSettlements(page = 1, pageSize = 10) {
    const [items, total] = await Promise.all([
      this.prisma.settlement.findMany({
        orderBy: { periodStart: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.settlement.count(),
    ]);

    return { items, total, page, pageSize };
  }

  async getSettlementDetail(id: string) {
    return this.prisma.settlement.findUniqueOrThrow({ where: { id } });
  }
}
