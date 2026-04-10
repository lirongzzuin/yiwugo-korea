import { Module } from '@nestjs/common';
import { ExchangeRateModule } from '@modules/exchange-rate/exchange-rate.module';
import { ShippingModule } from '@modules/shipping/shipping.module';
import { CartModule } from '@modules/cart/cart.module';
import { PaymentModule } from '@modules/payment/payment.module';
import { CouponModule } from '@modules/coupon/coupon.module';
import { PointsModule } from '@modules/points/points.module';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderEventHandler } from './order-event.handler';

@Module({
  imports: [
    ExchangeRateModule,
    ShippingModule,
    CartModule,
    PaymentModule,
    CouponModule,
    PointsModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderEventHandler],
  exports: [OrderService],
})
export class OrderModule {}
