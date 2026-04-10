import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentWebhookController } from './payment-webhook.controller';
import { TossPaymentsProvider } from './providers/toss-payments.provider';
import { KakaoPayProvider } from './providers/kakao-pay.provider';

@Module({
  controllers: [PaymentController, PaymentWebhookController],
  providers: [PaymentService, TossPaymentsProvider, KakaoPayProvider],
  exports: [PaymentService],
})
export class PaymentModule {}
