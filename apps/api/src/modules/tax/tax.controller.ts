import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '@common/decorators/current-user.decorator';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { TaxService } from './tax.service';

@ApiTags('Tax')
@ApiBearerAuth()
@Controller('tax')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post('cash-receipt')
  @ApiOperation({ summary: '현금영수증 발급' })
  async issueCashReceipt(
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      orderId: string;
      identityNumber: string;
      type: 'income' | 'expense';
    },
  ) {
    return this.taxService.issueCashReceipt(
      user.sub,
      body.orderId,
      body.identityNumber,
      body.type,
    );
  }

  @Post('invoice')
  @ApiOperation({ summary: '세금계산서 발급' })
  async issueInvoice(
    @CurrentUser() user: JwtPayload,
    @Body() body: { orderId: string; businessNumber: string },
  ) {
    return this.taxService.issueInvoice(
      user.sub,
      body.orderId,
      body.businessNumber,
    );
  }
}
