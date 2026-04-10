import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser, JwtPayload } from '@common/decorators/current-user.decorator';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { SettlementService } from './settlement.service';

@ApiTags('Settlement')
@ApiBearerAuth()
@Controller('settlements')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
@Roles('ADMIN')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Post('generate')
  @ApiOperation({ summary: '정산 생성' })
  async generateSettlement(
    @Body() body: { periodStart: string; periodEnd: string },
  ) {
    return this.settlementService.generateSettlement(
      new Date(body.periodStart),
      new Date(body.periodEnd),
    );
  }

  @Get()
  @ApiOperation({ summary: '정산 목록 조회' })
  async getSettlements(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.settlementService.getSettlements(
      page ? parseInt(page, 10) : undefined,
      pageSize ? parseInt(pageSize, 10) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '정산 상세 조회' })
  async getSettlementDetail(@Param('id') id: string) {
    return this.settlementService.getSettlementDetail(id);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: '정산 확정' })
  async confirmSettlement(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.settlementService.confirmSettlement(id, user.sub);
  }
}
