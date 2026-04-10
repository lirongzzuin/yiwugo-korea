import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { YiwugoModule } from '@modules/yiwugo/yiwugo.module';
import { TranslationModule } from '@modules/translation/translation.module';
import { ExchangeRateModule } from '@modules/exchange-rate/exchange-rate.module';

@Module({
  imports: [YiwugoModule, TranslationModule, ExchangeRateModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
