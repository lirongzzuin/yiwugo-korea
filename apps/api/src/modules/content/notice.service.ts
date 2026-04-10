import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

export interface CreateNoticeDto {
  title: string;
  content: string;
  category?: string;
  isPinned?: boolean;
}

export interface UpdateNoticeDto extends Partial<CreateNoticeDto> {}

@Injectable()
export class NoticeService {
  private readonly logger = new Logger(NoticeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createNotice(dto: CreateNoticeDto) {
    return this.prisma.notice.create({ data: dto });
  }

  async getNotices(page = 1, category?: string, pageSize = 20) {
    const where: Record<string, unknown> = {};
    if (category) where.category = category;

    const [items, total] = await Promise.all([
      this.prisma.notice.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.notice.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async getNoticeDetail(id: string) {
    const notice = await this.prisma.notice.findUnique({ where: { id } });
    if (!notice) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }

    // Increment view count
    await this.prisma.notice.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return { ...notice, viewCount: notice.viewCount + 1 };
  }

  async updateNotice(id: string, dto: UpdateNoticeDto) {
    const notice = await this.prisma.notice.findUnique({ where: { id } });
    if (!notice) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }

    return this.prisma.notice.update({ where: { id }, data: dto });
  }

  async deleteNotice(id: string) {
    const notice = await this.prisma.notice.findUnique({ where: { id } });
    if (!notice) {
      throw new NotFoundException('공지사항을 찾을 수 없습니다.');
    }

    await this.prisma.notice.delete({ where: { id } });
    return { success: true };
  }
}
