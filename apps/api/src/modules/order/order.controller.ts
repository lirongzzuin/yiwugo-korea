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
import { OrderStatus } from '@prisma/client';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // ─── User endpoints ────────────────────────────────────

  @Post()
  @ApiOperation({ summary: '주문 생성' })
  async createOrder(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(user.sub, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: '주문 상태별 개수' })
  async getOrderStats(@CurrentUser() user: JwtPayload) {
    return this.orderService.getOrderStats(user.sub);
  }

  @Get()
  @ApiOperation({ summary: '내 주문 목록' })
  async getOrders(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: OrderStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.orderService.getOrders(user.sub, {
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      status,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: '주문 상세 조회' })
  async getOrderDetail(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.orderService.getOrderDetail(user.sub, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '주문 취소' })
  async cancelOrder(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.orderService.cancelOrder(user.sub, id, body.reason);
  }

  @Post(':id/confirm')
  @ApiOperation({ summary: '구매 확정' })
  async confirmPurchase(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.orderService.confirmPurchase(user.sub, id);
  }

  // ─── Admin endpoints ───────────────────────────────────

  @Patch(':id/status')
  @Roles('ADMIN')
  @ApiOperation({ summary: '주문 상태 변경 (관리자)' })
  async updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { status: OrderStatus },
  ) {
    return this.orderService.updateStatus(id, body.status, user.sub);
  }

  @Get('admin/list')
  @Roles('ADMIN')
  @ApiOperation({ summary: '전체 주문 목록 (관리자)' })
  async getAdminOrders(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: OrderStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
  ) {
    return this.orderService.getAdminOrders({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      status,
      startDate,
      endDate,
      search,
    });
  }
}
