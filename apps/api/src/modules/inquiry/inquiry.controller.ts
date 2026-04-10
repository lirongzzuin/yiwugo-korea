import {
  Controller,
  Get,
  Post,
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
import { CurrentUser, JwtPayload } from '@common/decorators/current-user.decorator';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { InquiryService, CreateInquiryDto } from './inquiry.service';

@ApiTags('Inquiries')
@Controller('inquiries')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: '문의 등록' })
  async createInquiry(
    @Body() dto: CreateInquiryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inquiryService.createInquiry(dto, user?.sub);
  }

  @Get('my')
  @ApiBearerAuth()
  @ApiOperation({ summary: '내 문의 목록 조회' })
  async getMyInquiries(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
  ) {
    return this.inquiryService.getInquiries(
      user.sub,
      page ? parseInt(page, 10) : 1,
    );
  }

  @Get('admin/list')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: '[관리자] 문의 목록 조회' })
  async getAdminInquiries(
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
  ) {
    return this.inquiryService.getAdminInquiries({
      status,
      type,
      page: page ? parseInt(page, 10) : 1,
    });
  }

  @Get('admin/unanswered-count')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: '[관리자] 미답변 문의 수' })
  async getUnansweredCount() {
    return this.inquiryService.getUnansweredCount();
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: '문의 상세 조회' })
  async getInquiryDetail(@Param('id') id: string) {
    return this.inquiryService.getInquiryDetail(id);
  }

  @Post(':id/answer')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: '[관리자] 문의 답변' })
  async answerInquiry(
    @Param('id') id: string,
    @Body() body: { answer: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.inquiryService.answerInquiry(id, body.answer, user.sub);
  }
}
