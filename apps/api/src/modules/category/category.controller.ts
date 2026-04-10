import {
  Controller,
  Get,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { CategoryService } from './category.service';

@ApiTags('Categories')
@Controller('categories')
@UseInterceptors(TransformInterceptor)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '전체 카테고리 트리 조회' })
  async getAllCategories() {
    return this.categoryService.getAllCategories();
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: '카테고리 상세 조회 (slug)' })
  async getCategoryBySlug(@Param('slug') slug: string) {
    return this.categoryService.getCategoryBySlug(slug);
  }
}
