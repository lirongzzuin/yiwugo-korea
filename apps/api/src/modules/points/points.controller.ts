import {
  Controller,
  Get,
  Post,
  Body,
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
import { PointsService } from './points.service';
import { PointAction } from '@prisma/client';

@ApiTags('Points')
@ApiBearerAuth()
@Controller('points')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class PointsController {
  constructor(private readonly pointsService: PointsService) {}

  @Get()
  @ApiOperation({ summary: '포인트 잔액 조회' })
  async getBalance(@CurrentUser() user: JwtPayload) {
    const balance = await this.pointsService.getBalance(user.sub);
    return { balance };
  }

  @Get('history')
  @ApiOperation({ summary: '포인트 내역 조회' })
  async getHistory(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.pointsService.getHistory(
      user.sub,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Post('grant')
  @Roles('ADMIN')
  @ApiOperation({ summary: '포인트 수동 지급 (관리자)' })
  async grantPoints(
    @Body() body: { userId: string; amount: number; description: string },
  ) {
    await this.pointsService.earnPoints(
      body.userId,
      body.amount,
      PointAction.ADMIN_ADJUST,
      body.description,
    );
    return { message: '포인트가 지급되었습니다.' };
  }

  @Post('deduct')
  @Roles('ADMIN')
  @ApiOperation({ summary: '포인트 수동 차감 (관리자)' })
  async deductPoints(
    @Body() body: { userId: string; amount: number; reason: string },
  ) {
    await this.pointsService.deductPoints(
      body.userId,
      body.amount,
      body.reason,
    );
    return { message: '포인트가 차감되었습니다.' };
  }
}
