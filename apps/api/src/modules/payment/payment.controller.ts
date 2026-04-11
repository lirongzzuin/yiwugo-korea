import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { PaymentProvider } from '@prisma/client';
import { PaymentService } from './payment.service';

@ApiTags('Payments')
@Controller('payments')
@UseInterceptors(TransformInterceptor)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '결제 시작 (PG 결제 준비)' })
  async initiatePayment(
    @Body()
    body: {
      orderId: string;
      provider: PaymentProvider;
      method?: string;
    },
  ) {
    return this.paymentService.initiatePayment(
      body.orderId,
      body.provider,
      body.method,
    );
  }

  @Post('approve')
  @ApiOperation({ summary: '결제 승인 (PG 콜백)' })
  async approvePayment(
    @Body()
    body: {
      paymentKey: string;
      orderId: string;
      amount: number;
    },
  ) {
    return this.paymentService.approvePayment(
      body.paymentKey,
      body.orderId,
      body.amount,
    );
  }

  @Post(':id/cancel')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '결제 취소' })
  async cancelPayment(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.paymentService.cancelPayment(id, body.reason);
  }

  @Get(':orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '결제 정보 조회' })
  async getPayment(@Param('orderId') orderId: string) {
    return this.paymentService.getPayment(orderId);
  }
}
