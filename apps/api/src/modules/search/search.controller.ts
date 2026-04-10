import {
  Controller,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { SearchService } from './search.service';

@ApiTags('Search')
@Controller('search')
@UseInterceptors(TransformInterceptor)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '상품 검색 (Meilisearch)' })
  @ApiQuery({ name: 'q', required: true, description: '검색 키워드' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['price_asc', 'price_desc', 'sales', 'newest'],
  })
  async search(
    @Query('q') q: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('categoryId') categoryId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    const result = await this.searchService.search(
      q || '',
      {
        categoryId,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        sortBy,
      },
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );

    return {
      items: result.hits,
      total: result.totalHits,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  @Public()
  @Get('autocomplete')
  @ApiOperation({ summary: '검색 자동완성' })
  @ApiQuery({ name: 'q', required: true })
  async autocomplete(@Query('q') q: string) {
    return this.searchService.getAutoComplete(q || '');
  }

  @Public()
  @Get('popular')
  @ApiOperation({ summary: '인기 검색어' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPopularKeywords(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    return this.searchService.getPopularKeywords(parsedLimit);
  }
}
