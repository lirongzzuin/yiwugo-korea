import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { YiwugoModule } from '@modules/yiwugo/yiwugo.module';
import { TranslationModule } from '@modules/translation/translation.module';
import { ExchangeRateModule } from '@modules/exchange-rate/exchange-rate.module';

@Module({
  imports: [YiwugoModule, TranslationModule, ExchangeRateModule],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}
