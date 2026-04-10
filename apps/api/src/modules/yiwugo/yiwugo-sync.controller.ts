import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { YiwugoSyncService } from './yiwugo-sync.service';
import { CategoryService } from '@modules/category/category.service';

@ApiTags('Admin - Sync')
@Controller('admin/sync')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class YiwugoSyncController {
  constructor(
    private readonly syncService: YiwugoSyncService,
    private readonly categoryService: CategoryService,
  ) {}

  @Post('categories')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Yiwugo 카테고리 동기화' })
  async syncCategories() {
    const result = await this.categoryService.syncFromYiwugo();
    return {
      success: true,
      message: '카테고리 동기화 완료',
      data: result,
    };
  }

  @Post('products')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Yiwugo 상품 검색 및 동기화' })
  async syncProducts(@Body() body: { keyword: string; page?: number }) {
    const result = await this.syncService.syncProductBatch(body.keyword, body.page || 1);
    return {
      success: true,
      message: '상품 동기화 완료',
      data: { synced: result },
    };
  }

  @Post('products/:productId')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '특정 상품 동기화' })
  async syncProduct(@Param('productId') productId: string) {
    await this.syncService.syncProduct(productId);
    return {
      success: true,
      message: `상품 ${productId} 동기화 완료`,
    };
  }

  @Post('shops/:shopId')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '특정 상점 동기화' })
  async syncShop(@Param('shopId') shopId: string) {
    await this.syncService.syncShop(shopId);
    return {
      success: true,
      message: `상점 ${shopId} 동기화 완료`,
    };
  }
}
