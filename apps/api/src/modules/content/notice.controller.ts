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
import { NoticeService, CreateNoticeDto, UpdateNoticeDto } from './notice.service';

@ApiTags('Notices')
@Controller('notices')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class NoticeController {
  constructor(private readonly noticeService: NoticeService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: '공지사항 목록 조회' })
  async getNotices(
    @Query('page') page?: string,
    @Query('category') category?: string,
  ) {
    return this.noticeService.getNotices(
      page ? parseInt(page, 10) : 1,
      category,
    );
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: '공지사항 상세 조회' })
  async getNoticeDetail(@Param('id') id: string) {
    return this.noticeService.getNoticeDetail(id);
  }

  @Post()
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: '[관리자] 공지사항 등록' })
  async createNotice(@Body() dto: CreateNoticeDto) {
    return this.noticeService.createNotice(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: '[관리자] 공지사항 수정' })
  async updateNotice(
    @Param('id') id: string,
    @Body() dto: UpdateNoticeDto,
  ) {
    return this.noticeService.updateNotice(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: '[관리자] 공지사항 삭제' })
  async deleteNotice(@Param('id') id: string) {
    return this.noticeService.deleteNotice(id);
  }
}
