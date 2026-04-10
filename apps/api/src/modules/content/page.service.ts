import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class PageService {
  private readonly logger = new Logger(PageService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPage(slug: string) {
    const page = await this.prisma.staticPage.findUnique({
      where: { slug },
    });

    if (!page) {
      throw new NotFoundException('페이지를 찾을 수 없습니다.');
    }

    return page;
  }

  async updatePage(slug: string, content: string) {
    const existing = await this.prisma.staticPage.findUnique({
      where: { slug },
    });

    if (!existing) {
      // Create if not exists
      return this.prisma.staticPage.create({
        data: { slug, content, version: 1 },
      });
    }

    return this.prisma.staticPage.update({
      where: { slug },
      data: {
        content,
        version: { increment: 1 },
      },
    });
  }
}
