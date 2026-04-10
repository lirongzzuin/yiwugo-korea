import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class PopularProductsService {
  constructor(private prisma: PrismaService) {}

  async getPopularProducts(limit = 20) {
    return this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: { salesCount: 'desc' },
      take: limit,
      select: {
        id: true,
        yiwugoId: true,
        titleKo: true,
        priceKrw: true,
        originalPriceKrw: true,
        salesCount: true,
        viewCount: true,
        imageUrls: true,
        averageRating: true,
        reviewCount: true,
      },
    });
  }
}
