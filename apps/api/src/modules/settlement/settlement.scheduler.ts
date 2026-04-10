import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SettlementService } from './settlement.service';

@Injectable()
export class SettlementScheduler {
  private readonly logger = new Logger(SettlementScheduler.name);

  constructor(private readonly settlementService: SettlementService) {}

  /**
   * Every Monday at midnight (KST 09:00) — auto-generate weekly settlement
   * for the previous week (Monday 00:00 to Sunday 23:59:59).
   */
  @Cron('0 0 * * 1')
  async generateWeeklySettlement() {
    this.logger.log('Starting weekly settlement generation...');

    const now = new Date();
    // Previous Monday
    const periodEnd = new Date(now);
    periodEnd.setDate(now.getDate() - 1); // Sunday
    periodEnd.setHours(23, 59, 59, 999);

    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodEnd.getDate() - 6); // Previous Monday
    periodStart.setHours(0, 0, 0, 0);

    try {
      const settlement = await this.settlementService.generateSettlement(
        periodStart,
        periodEnd,
      );
      this.logger.log(
        `Weekly settlement generated: ${settlement.id} (${periodStart.toISOString()} ~ ${periodEnd.toISOString()})`,
      );
    } catch (error) {
      this.logger.error('Failed to generate weekly settlement', error);
    }
  }
}
