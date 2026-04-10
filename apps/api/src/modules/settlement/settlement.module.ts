import { Module } from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { SettlementController } from './settlement.controller';
import { SettlementScheduler } from './settlement.scheduler';

@Module({
  controllers: [SettlementController],
  providers: [SettlementService, SettlementScheduler],
  exports: [SettlementService],
})
export class SettlementModule {}
