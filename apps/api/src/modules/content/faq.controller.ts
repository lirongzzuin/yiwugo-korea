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
import { FaqService, CreateFaqDto, UpdateFaqDto } from './faq.service';

@ApiTags('FAQs')
@Controller('faqs')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'FAQ 목록 조회' })
  async getFaqs(@Query('category') category?: string) {
    return this.faqService.getFaqs(category);
  }

  @Post()
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: '[관리자] FAQ 등록' })
  async createFaq(@Body() dto: CreateFaqDto) {
    return this.faqService.createFaq(dto);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: '[관리자] FAQ 수정' })
  async updateFaq(
    @Param('id') id: string,
    @Body() dto: UpdateFaqDto,
  ) {
    return this.faqService.updateFaq(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('ADMIN')
  @ApiOperation({ summary: '[관리자] FAQ 삭제' })
  async deleteFaq(@Param('id') id: string) {
    return this.faqService.deleteFaq(id);
  }
}
