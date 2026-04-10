import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { ShopService } from './shop.service';

@ApiTags('Shops')
@Controller('shops')
@UseInterceptors(TransformInterceptor)
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Public()
  @Get('search')
  @ApiOperation({ summary: '상점 검색' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'number', required: false, type: Number })
  @ApiQuery({ name: 'subMarket', required: false })
  @ApiQuery({ name: 'subFloor', required: false })
  async searchShops(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('number') number?: string,
    @Query('subMarket') subMarket?: string,
    @Query('subFloor') subFloor?: string,
  ) {
    return this.shopService.searchShops({
      q,
      page: page ? parseInt(page, 10) : undefined,
      number: number ? parseInt(number, 10) : undefined,
      subMarket,
      subFloor,
    });
  }

  @Public()
  @Get(':shopId')
  @ApiOperation({ summary: '상점 상세 조회' })
  async getShopDetail(@Param('shopId') shopId: string) {
    return this.shopService.getShopDetail(shopId);
  }

  @Public()
  @Get(':shopId/categories')
  @ApiOperation({ summary: '상점 내부 카테고리별 상품 수량' })
  async getShopCategories(@Param('shopId') shopId: string) {
    return this.shopService.getShopCategories(shopId);
  }

  @Public()
  @Get(':shopId/products')
  @ApiOperation({ summary: '상점 내부 상품 검색' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'productLable', required: false })
  @ApiQuery({ name: 'st', required: false, description: '1=최신, 9=판매량, 4=가격↑, 3=가격↓' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  async searchShopProducts(
    @Param('shopId') shopId: string,
    @Query('keyword') keyword?: string,
    @Query('productLable') productLable?: string,
    @Query('dt') dt?: string,
    @Query('st') st?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.shopService.searchShopProducts({
      shopId,
      keyword,
      productLable,
      dt,
      st,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }
}
