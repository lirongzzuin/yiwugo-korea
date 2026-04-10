import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Public } from '@common/decorators/public.decorator';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { PageService } from './page.service';

@ApiTags('Pages')
@Controller('pages')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: '정적 페이지 조회 (이용약관, 개인정보처리방침 등)' })
  async getPage(@Param('slug') slug: string) {
    return this.pageService.getPage(slug);
  }

  @Put(':slug')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: '[관리자] 정적 페이지 수정' })
  async updatePage(
    @Param('slug') slug: string,
    @Body() body: { content: string },
  ) {
    return this.pageService.updatePage(slug, body.content);
  }
}
