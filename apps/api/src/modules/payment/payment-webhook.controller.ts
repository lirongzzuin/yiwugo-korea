import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { PaymentProvider } from '@prisma/client';
import { PaymentService } from './payment.service';

@ApiTags('Payment Webhooks')
@Controller('webhooks')
export class PaymentWebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('tosspayments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Toss Payments 웹훅 핸들러' })
  async handleTossWebhook(
    @Body() body: any,
    @Headers() headers: any,
  ) {
    return this.paymentService.handleWebhook(
      PaymentProvider.TOSS_PAYMENTS,
      body,
      headers,
    );
  }

  @Post('kakaopay')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'KakaoPay 웹훅 핸들러' })
  @ApiExcludeEndpoint()
  async handleKakaoPayWebhook(
    @Body() body: any,
    @Headers() headers: any,
  ) {
    return this.paymentService.handleWebhook(
      PaymentProvider.KAKAO_PAY,
      body,
      headers,
    );
  }
}
