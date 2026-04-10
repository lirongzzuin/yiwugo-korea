import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ExchangeRateModule } from '@modules/exchange-rate/exchange-rate.module';

@Module({
  imports: [ExchangeRateModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
