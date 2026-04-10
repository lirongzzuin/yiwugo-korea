import { Module } from '@nestjs/common';
import { PaymentModule } from '@modules/payment/payment.module';
import { CouponModule } from '@modules/coupon/coupon.module';
import { PointsModule } from '@modules/points/points.module';
import { RefundService } from './refund.service';
import { RefundController } from './refund.controller';

@Module({
  imports: [PaymentModule, CouponModule, PointsModule],
  controllers: [RefundController],
  providers: [RefundService],
  exports: [RefundService],
})
export class RefundModule {}
