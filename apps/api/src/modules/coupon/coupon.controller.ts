import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';

@ApiTags('Coupons')
@ApiBearerAuth()
@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  // ─── User endpoints ────────────────────────────────────

  @Get('my')
  @ApiOperation({ summary: '내 쿠폰 목록 조회' })
  async getUserCoupons(@CurrentUser() user: JwtPayload) {
    return this.couponService.getUserCoupons(user.sub);
  }

  @Post('redeem')
  @ApiOperation({ summary: '프로모 코드로 쿠폰 등록' })
  async redeemCoupon(
    @CurrentUser() user: JwtPayload,
    @Body() body: { code: string },
  ) {
    return this.couponService.issueByCode(user.sub, body.code);
  }

  @Post('apply')
  @ApiOperation({ summary: '쿠폰 할인 금액 미리보기' })
  async applyCoupon(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ApplyCouponDto,
  ) {
    return this.couponService.applyCoupon(
      user.sub,
      dto.couponId,
      dto.orderAmount,
      dto.categoryId,
    );
  }

  // ─── Admin endpoints ───────────────────────────────────

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: '쿠폰 생성 (관리자)' })
  async createCoupon(@Body() dto: CreateCouponDto) {
    return this.couponService.createCoupon(dto);
  }

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: '전체 쿠폰 목록 (관리자)' })
  async getCoupons(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.couponService.getCoupons({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
    });
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: '쿠폰 수정 (관리자)' })
  async updateCoupon(
    @Param('id') id: string,
    @Body() body: Partial<CreateCouponDto>,
  ) {
    const data: any = { ...body };
    if (body.startsAt) data.startsAt = new Date(body.startsAt);
    if (body.expiresAt) data.expiresAt = new Date(body.expiresAt);
    if (body.code) data.code = body.code.toUpperCase();

    return this.couponService['prisma'].coupon.update({
      where: { id },
      data,
    });
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: '쿠폰 비활성화 (관리자)' })
  async deactivateCoupon(@Param('id') id: string) {
    await this.couponService.deactivateCoupon(id);
    return { message: '쿠폰이 비활성화되었습니다.' };
  }
}
