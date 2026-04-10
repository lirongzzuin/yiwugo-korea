import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

export interface CreateBannerDto {
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position?: string;
  sortOrder?: number;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateBannerDto extends Partial<CreateBannerDto> {}

@Injectable()
export class BannerService {
  private readonly logger = new Logger(BannerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createBanner(dto: CreateBannerDto) {
    return this.prisma.banner.create({ data: dto });
  }

  async getBanners(position?: string) {
    const where: Record<string, unknown> = {};
    if (position) where.position = position;

    return this.prisma.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getActiveBanners(position?: string) {
    const now = new Date();

    const where: Record<string, unknown> = {
      isActive: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } },
      ],
    };

    if (position) where.position = position;

    return this.prisma.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async updateBanner(id: string, dto: UpdateBannerDto) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException('배너를 찾을 수 없습니다.');
    }

    return this.prisma.banner.update({ where: { id }, data: dto });
  }

  async deleteBanner(id: string) {
    const banner = await this.prisma.banner.findUnique({ where: { id } });
    if (!banner) {
      throw new NotFoundException('배너를 찾을 수 없습니다.');
    }

    await this.prisma.banner.delete({ where: { id } });
    return { success: true };
  }
}
