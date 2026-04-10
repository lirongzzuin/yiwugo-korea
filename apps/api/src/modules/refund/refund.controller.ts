import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '@common/decorators/current-user.decorator';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { RefundStatus } from '@prisma/client';
import { RefundService } from './refund.service';
import { CreateRefundDto } from './dto/create-refund.dto';

@ApiTags('Refunds')
@ApiBearerAuth()
@Controller('refunds')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Post()
  @ApiOperation({ summary: '환불 요청' })
  async requestRefund(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateRefundDto,
  ) {
    return this.refundService.requestRefund(user.sub, dto);
  }

  @Get(':orderId')
  @ApiOperation({ summary: '환불 정보 조회' })
  async getRefund(@Param('orderId') orderId: string) {
    return this.refundService.getRefund(orderId);
  }

  @Patch(':id/approve')
  @Roles('ADMIN')
  @ApiOperation({ summary: '환불 승인 (관리자)' })
  async approveRefund(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.refundService.approveRefund(id, user.sub);
  }

  @Patch(':id/reject')
  @Roles('ADMIN')
  @ApiOperation({ summary: '환불 거절 (관리자)' })
  async rejectRefund(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { reason: string },
  ) {
    return this.refundService.rejectRefund(id, user.sub, body.reason);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: '환불 목록 (관리자)' })
  async getRefundList(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: RefundStatus,
  ) {
    return this.refundService.getRefundList({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      status,
    });
  }
}
