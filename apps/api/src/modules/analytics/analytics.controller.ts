import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
@Roles('ADMIN')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('kpi')
  @ApiOperation({ summary: '대시보드 KPI 조회' })
  async getKPI(
    @Query('period') period: 'today' | 'week' | 'month' = 'today',
  ) {
    return this.analyticsService.getDashboardKPI(period);
  }

  @Get('sales')
  @ApiOperation({ summary: '매출 차트 데이터' })
  async getSalesChart(
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
    @Query('days') days?: string,
  ) {
    return this.analyticsService.getSalesChart(
      period,
      days ? parseInt(days, 10) : 30,
    );
  }

  @Get('top-products')
  @ApiOperation({ summary: '인기 상품 순위' })
  async getTopProducts(@Query('limit') limit?: string) {
    return this.analyticsService.getTopProducts(
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('customers')
  @ApiOperation({ summary: '고객 통계' })
  async getCustomerStats() {
    return this.analyticsService.getCustomerStats();
  }
}
