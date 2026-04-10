import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Public } from '@common/decorators/public.decorator';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { BannerService, CreateBannerDto, UpdateBannerDto } from './banner.service';

@ApiTags('Banners')
@Controller('banners')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '활성 배너 목록 조회' })
  async getActiveBanners(@Query('position') position?: string) {
    return this.bannerService.getActiveBanners(position);
  }

  @Post()
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: '[관리자] 배너 등록' })
  async createBanner(@Body() dto: CreateBannerDto) {
    return this.bannerService.createBanner(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: '[관리자] 배너 수정' })
  async updateBanner(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
  ) {
    return this.bannerService.updateBanner(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: '[관리자] 배너 삭제' })
  async deleteBanner(@Param('id') id: string) {
    return this.bannerService.deleteBanner(id);
  }
}
