import { Module } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';
import { ExchangeRateController } from './exchange-rate.controller';
import { ExchangeRateScheduler } from './exchange-rate.scheduler';

@Module({
  controllers: [ExchangeRateController],
  providers: [ExchangeRateService, ExchangeRateScheduler],
  exports: [ExchangeRateService],
})
export class ExchangeRateModule {}
