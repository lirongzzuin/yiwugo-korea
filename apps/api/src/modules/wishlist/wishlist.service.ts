import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

export interface WishlistItemResponse {
  id: string;
  productId: string;
  titleKo: string;
  titleOriginal: string;
  imageUrl: string | null;
  priceKrw: string;
  priceCny: string;
  minOrderQty: number;
  shopNameKo: string | null;
  createdAt: string;
}

export interface WishlistResult {
  items: WishlistItemResponse[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get user's wishlist with pagination
   */
  async getWishlist(
    userId: string,
    page = 1,
    pageSize = 20,
  ): Promise<WishlistResult> {
    const [items, total] = await Promise.all([
      this.prisma.wishlistItem.findMany({
        where: { userId },
        include: {
          product: {
            include: { shop: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.wishlistItem.count({ where: { userId } }),
    ]);

    return {
      items: items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        titleKo: item.product.titleKo,
        titleOriginal: item.product.titleOriginal,
        imageUrl:
          item.product.imageProxyUrls?.[0] ??
          item.product.imageUrls?.[0] ??
          null,
        priceKrw: String(item.product.priceKrw),
        priceCny: String(item.product.priceOriginalCny),
        minOrderQty: item.product.minOrderQty,
        shopNameKo: item.product.shop?.nameKo ?? null,
        createdAt: item.createdAt.toISOString(),
      })),
      total,
      page,
      pageSize,
    };
  }

  /**
   * Add product to wishlist
   */
  async addItem(userId: string, productId: string): Promise<WishlistItemResponse> {
    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { shop: true },
    });

    if (!product) {
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }

    // Check if already wishlisted
    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      throw new ConflictException('이미 찜한 상품입니다.');
    }

    const item = await this.prisma.wishlistItem.create({
      data: { userId, productId },
      include: { product: { include: { shop: true } } },
    });

    // Increment wishlist count on product
    await this.prisma.product.update({
      where: { id: productId },
      data: { wishlistCount: { increment: 1 } },
    });

    return {
      id: item.id,
      productId: item.productId,
      titleKo: item.product.titleKo,
      titleOriginal: item.product.titleOriginal,
      imageUrl:
        item.product.imageProxyUrls?.[0] ??
        item.product.imageUrls?.[0] ??
        null,
      priceKrw: String(item.product.priceKrw),
      priceCny: String(item.product.priceOriginalCny),
      minOrderQty: item.product.minOrderQty,
      shopNameKo: item.product.shop?.nameKo ?? null,
      createdAt: item.createdAt.toISOString(),
    };
  }

  /**
   * Remove product from wishlist
   */
  async removeItem(userId: string, productId: string): Promise<void> {
    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (!existing) {
      throw new NotFoundException('찜 목록에 없는 상품입니다.');
    }

    await this.prisma.wishlistItem.delete({
      where: { userId_productId: { userId, productId } },
    });

    // Decrement wishlist count on product
    await this.prisma.product.update({
      where: { id: productId },
      data: { wishlistCount: { decrement: 1 } },
    });
  }

  /**
   * Check if a product is wishlisted by user
   */
  async isWishlisted(userId: string, productId: string): Promise<boolean> {
    const item = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    return !!item;
  }

  /**
   * Toggle wishlist: add if not present, remove if present
   */
  async toggleWishlist(
    userId: string,
    productId: string,
  ): Promise<{ wishlisted: boolean }> {
    const existing = await this.prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await this.removeItem(userId, productId);
      return { wishlisted: false };
    } else {
      await this.addItem(userId, productId);
      return { wishlisted: true };
    }
  }
}
