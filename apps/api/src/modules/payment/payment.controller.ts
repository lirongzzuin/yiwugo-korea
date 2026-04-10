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
import { PaymentService } from './payment.service';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

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
  @ApiOperation({ summary: '결제 취소' })
  async cancelPayment(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.paymentService.cancelPayment(id, body.reason);
  }

  @Get(':orderId')
  @ApiOperation({ summary: '결제 정보 조회' })
  async getPayment(@Param('orderId') orderId: string) {
    return this.paymentService.getPayment(orderId);
  }
}
