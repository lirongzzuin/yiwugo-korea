import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

export interface CreateInquiryDto {
  type: string;
  title: string;
  content: string;
  email?: string;
  phone?: string;
  attachments?: string[];
}

export interface AdminInquiryParams {
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class InquiryService {
  private readonly logger = new Logger(InquiryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createInquiry(dto: CreateInquiryDto, userId?: string) {
    return this.prisma.inquiry.create({
      data: {
        ...dto,
        userId: userId || null,
        status: 'PENDING',
      },
    });
  }

  async getInquiries(userId: string, page = 1, pageSize = 20) {
    const [items, total] = await Promise.all([
      this.prisma.inquiry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.inquiry.count({ where: { userId } }),
    ]);

    return { items, total, page, pageSize };
  }

  async getInquiryDetail(id: string) {
    const inquiry = await this.prisma.inquiry.findUnique({ where: { id } });

    if (!inquiry) {
      throw new NotFoundException('문의를 찾을 수 없습니다.');
    }

    return inquiry;
  }

  async answerInquiry(id: string, answer: string, adminId: string) {
    const inquiry = await this.prisma.inquiry.findUnique({ where: { id } });

    if (!inquiry) {
      throw new NotFoundException('문의를 찾을 수 없습니다.');
    }

    return this.prisma.inquiry.update({
      where: { id },
      data: {
        answer,
        status: 'ANSWERED',
        answeredAt: new Date(),
        answeredBy: adminId,
      },
    });
  }

  async getAdminInquiries(params: AdminInquiryParams) {
    const { status, type, page = 1, pageSize = 20 } = params;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [items, total] = await Promise.all([
      this.prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.inquiry.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async getUnansweredCount() {
    const count = await this.prisma.inquiry.count({
      where: { status: 'PENDING' },
    });

    return { count };
  }
}
