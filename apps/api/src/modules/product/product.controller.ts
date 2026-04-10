import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { ProductService } from './product.service';
import { SearchProductDto } from './dto/search-product.dto';

@ApiTags('Products')
@Controller('products')
@UseInterceptors(TransformInterceptor)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Public()
  @Get('search')
  @ApiOperation({ summary: '상품 검색' })
  async searchProducts(@Query() dto: SearchProductDto) {
    const result = await this.productService.searchProducts(dto);
    return {
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: '추천 상품 목록' })
  async getFeaturedProducts() {
    return this.productService.getFeaturedProducts();
  }

  @Public()
  @Get('popular')
  @ApiOperation({ summary: '인기 상품 목록' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPopularProducts(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    return this.productService.getPopularProducts(parsedLimit);
  }

  @Public()
  @Get('image-search')
  @ApiOperation({ summary: '이미지로 상품 검색' })
  @ApiQuery({ name: 'imgUrl', required: true })
  async searchByImage(@Query('imgUrl') imgUrl: string) {
    return this.productService.searchByImage(imgUrl);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '상품 상세 조회' })
  async getProductDetail(@Param('id') id: string) {
    // Fire and forget view count increment
    this.productService.incrementViewCount(id).catch(() => {});
    return this.productService.getProductDetail(id);
  }
}
