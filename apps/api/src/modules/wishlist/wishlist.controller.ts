import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '@common/decorators/current-user.decorator';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { WishlistService } from './wishlist.service';

@ApiTags('Wishlist')
@ApiBearerAuth()
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@UseInterceptors(TransformInterceptor)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: '찜 목록 조회' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async getWishlist(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const p = page ? parseInt(page, 10) : 1;
    const ps = pageSize ? parseInt(pageSize, 10) : 20;
    const result = await this.wishlistService.getWishlist(user.sub, p, ps);
    return {
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  @Post(':productId')
  @ApiOperation({ summary: '찜하기 (토글)' })
  async toggleWishlist(
    @CurrentUser() user: JwtPayload,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.toggleWishlist(user.sub, productId);
  }

  @Delete(':productId')
  @ApiOperation({ summary: '찜 해제' })
  async removeItem(
    @CurrentUser() user: JwtPayload,
    @Param('productId') productId: string,
  ) {
    await this.wishlistService.removeItem(user.sub, productId);
    return { message: '찜이 해제되었습니다.' };
  }

  @Get(':productId/check')
  @ApiOperation({ summary: '찜 여부 확인' })
  async checkWishlisted(
    @CurrentUser() user: JwtPayload,
    @Param('productId') productId: string,
  ) {
    const wishlisted = await this.wishlistService.isWishlisted(
      user.sub,
      productId,
    );
    return { wishlisted };
  }
}
