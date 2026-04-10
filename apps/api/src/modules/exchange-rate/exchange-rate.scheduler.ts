import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '@prisma/prisma.service';
import { ExchangeRateService } from './exchange-rate.service';

/** Percentage threshold for rate change warning */
const RATE_CHANGE_WARN_THRESHOLD = 0.01; // 1%

@Injectable()
export class ExchangeRateScheduler {
  private readonly logger = new Logger(ExchangeRateScheduler.name);

  constructor(
    private readonly exchangeRateService: ExchangeRateService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Fetch and cache the exchange rate every 5 minutes
   * Also logs to ExchangeRate DB table and checks for unusual changes
   */
  @Cron('*/5 * * * *') // every 5 minutes
  async updateExchangeRate(): Promise<void> {
    this.logger.debug('Fetching exchange rate...');

    try {
      const result = await this.exchangeRateService.fetchRate();

      // Log to DB
      await this.prisma.exchangeRate.create({
        data: {
          fromCurrency: 'CNY',
          toCurrency: 'KRW',
          rate: result.rate,
          source: result.source,
          recordedAt: result.updatedAt,
        },
      });

      // Check for >1% change compared to previous record
      await this.checkForSignificantChange(result.rate);

      this.logger.debug(
        `Exchange rate updated: 1 CNY = ${result.rate} KRW (source: ${result.source})`,
      );
    } catch (error) {
      this.logger.error('Failed to update exchange rate', error);
    }
  }

  /**
   * Compare current rate against the previous one and warn if change > threshold
   */
  private async checkForSignificantChange(currentRate: number): Promise<void> {
    try {
      const previousRecords = await this.prisma.exchangeRate.findMany({
        where: { fromCurrency: 'CNY', toCurrency: 'KRW' },
        orderBy: { recordedAt: 'desc' },
        take: 2, // current + previous
      });

      if (previousRecords.length < 2) return;

      const previousRate = Number(previousRecords[1].rate);
      if (previousRate === 0) return;

      const changePercent = Math.abs(
        (currentRate - previousRate) / previousRate,
      );

      if (changePercent > RATE_CHANGE_WARN_THRESHOLD) {
        const direction = currentRate > previousRate ? '상승' : '하락';
        const pctStr = (changePercent * 100).toFixed(2);

        this.logger.warn(
          `[환율 급변 알림] CNY/KRW 환율이 ${pctStr}% ${direction}했습니다. ` +
            `이전: ${previousRate}, 현재: ${currentRate}`,
        );

        // Store a system setting flag for admin dashboard to pick up
        await this.prisma.systemSetting.upsert({
          where: { key: 'exchange_rate_alert' },
          create: {
            key: 'exchange_rate_alert',
            value: JSON.stringify({
              previousRate,
              currentRate,
              changePercent: pctStr,
              direction,
              detectedAt: new Date().toISOString(),
            }),
          },
          update: {
            value: JSON.stringify({
              previousRate,
              currentRate,
              changePercent: pctStr,
              direction,
              detectedAt: new Date().toISOString(),
            }),
          },
        });
      }
    } catch (error) {
      this.logger.warn('Failed to check rate change', error);
    }
  }
}
