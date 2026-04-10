import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

export interface CreateFaqDto {
  question: string;
  answer: string;
  category?: string;
  sortOrder?: number;
}

export interface UpdateFaqDto extends Partial<CreateFaqDto> {}

@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createFaq(dto: CreateFaqDto) {
    return this.prisma.faq.create({ data: dto });
  }

  async getFaqs(category?: string) {
    const where: Record<string, unknown> = {};
    if (category) where.category = category;

    return this.prisma.faq.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async updateFaq(id: string, dto: UpdateFaqDto) {
    const faq = await this.prisma.faq.findUnique({ where: { id } });
    if (!faq) {
      throw new NotFoundException('FAQ를 찾을 수 없습니다.');
    }

    return this.prisma.faq.update({ where: { id }, data: dto });
  }

  async deleteFaq(id: string) {
    const faq = await this.prisma.faq.findUnique({ where: { id } });
    if (!faq) {
      throw new NotFoundException('FAQ를 찾을 수 없습니다.');
    }

    await this.prisma.faq.delete({ where: { id } });
    return { success: true };
  }
}
