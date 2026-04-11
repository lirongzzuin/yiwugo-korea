import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { RecommendationService } from './recommendation.service';
import { ActivityTrackerService } from './activity-tracker.service';
import { UserActionType } from '@prisma/client';

@ApiTags('Recommendations')
@Controller('recommendations')
@UseInterceptors(TransformInterceptor)
export class RecommendationController {
  constructor(
    private readonly recommendationService: RecommendationService,
    private readonly activityTracker: ActivityTrackerService,
  ) {}

  @Get('personalized')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '사용자 맞춤 추천 상품' })
  async getPersonalized(
    @Req() req: any,
    @Query('limit') limit?: string,
    @Query('exclude') exclude?: string,
  ) {
    const excludeIds = exclude ? exclude.split(',') : [];
    return this.recommendationService.getPersonalizedRecommendations(
      req.user.id,
      limit ? parseInt(limit) : 20,
      excludeIds,
    );
  }

  @Get('similar/:productId')
  @ApiOperation({ summary: '유사 상품 추천' })
  async getSimilar(
    @Param('productId') productId: string,
    @Query('limit') limit?: string,
  ) {
    return this.recommendationService.getSimilarProducts(
      productId,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('also-bought/:productId')
  @ApiOperation({ summary: '함께 구매한 상품 추천' })
  async getAlsoBought(
    @Param('productId') productId: string,
    @Query('limit') limit?: string,
  ) {
    return this.recommendationService.getAlsoBoughtProducts(
      productId,
      limit ? parseInt(limit) : 10,
    );
  }

  @Post('track')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '사용자 행동 기록 (프론트엔드용)' })
  async trackActivity(
    @Req() req: any,
    @Body() body: {
      actionType: UserActionType;
      productId?: string;
      categoryId?: string;
      metadata?: Record<string, any>;
    },
  ) {
    // fire-and-forget: 응답을 기다리지 않고 즉시 반환
    this.activityTracker.track(
      req.user.id,
      body.actionType,
      body.productId,
      body.categoryId,
      body.metadata,
    );
    return { status: 'ok' };
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '사용자 선호도 프로필 조회' })
  async getProfile(@Req() req: any) {
    return this.recommendationService.getUserProfile(req.user.id);
  }
}
