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
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '@common/decorators/current-user.decorator';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';

@ApiTags('Reviews')
@ApiBearerAuth()
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiOperation({ summary: '리뷰 작성' })
  async createReview(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.createReview(user.sub, dto);
  }

  @Get('product/:productId')
  @Public()
  @ApiOperation({ summary: '상품 리뷰 목록' })
  async getProductReviews(
    @Param('productId') productId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.reviewService.getProductReviews(
      productId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Get('my')
  @ApiOperation({ summary: '내 리뷰 목록' })
  async getUserReviews(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.reviewService.getUserReviews(
      user.sub,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Get('product/:productId/stats')
  @Public()
  @ApiOperation({ summary: '상품 리뷰 통계' })
  async getReviewStats(@Param('productId') productId: string) {
    return this.reviewService.getReviewStats(productId);
  }

  @Patch(':id/hide')
  @Roles('ADMIN')
  @ApiOperation({ summary: '리뷰 숨김 (관리자)' })
  async hideReview(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.reviewService.hideReview(id, body.reason, user.sub);
  }
}
