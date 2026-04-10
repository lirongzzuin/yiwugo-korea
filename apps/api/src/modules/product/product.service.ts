import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { RedisService } from '@common/services/redis.service';
import { YiwugoApiClient } from '@modules/yiwugo/yiwugo-api.client';
import { TranslationService } from '@modules/translation/translation.service';
import { ExchangeRateService } from '@modules/exchange-rate/exchange-rate.service';
import { Product, ProductSearchResult } from '@yiwugo/shared';
import { SearchProductDto, SortBy } from './dto/search-product.dto';

const CACHE_TTL = {
  SEARCH: 600, // 10 minutes
  PRODUCT_DETAIL: 1800, // 30 minutes
  FEATURED: 300, // 5 minutes
  POPULAR: 300, // 5 minutes
};

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly yiwugoApiClient: YiwugoApiClient,
    private readonly translationService: TranslationService,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  /**
   * Search products: first try DB (CachedProduct), fallback to Yiwugo API
   */
  async searchProducts(params: SearchProductDto): Promise<ProductSearchResult> {
    const { q, category, page = 1, pageSize = 20, sortBy, minPrice, maxPrice } = params;

    // Try cache
    const cacheKey = `product:search:${JSON.stringify(params)}`;
    const cached = await this.getCache<ProductSearchResult>(cacheKey);
    if (cached) return cached;

    // Build Prisma where clause
    const where: any = {
      isActive: true,
    };

    if (q) {
      where.OR = [
        { titleKo: { contains: q, mode: 'insensitive' } },
        { titleOriginal: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categoryId = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.priceKrw = {};
      if (minPrice !== undefined) {
        where.priceKrw.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.priceKrw.lte = maxPrice;
      }
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' };
    switch (sortBy) {
      case SortBy.PRICE_ASC:
        orderBy = { priceKrw: 'asc' };
        break;
      case SortBy.PRICE_DESC:
        orderBy = { priceKrw: 'desc' };
        break;
      case SortBy.SALES:
        orderBy = { salesCount: 'desc' };
        break;
      case SortBy.NEWEST:
        orderBy = { createdAt: 'desc' };
        break;
      case SortBy.RATING:
        orderBy = { averageRating: 'desc' };
        break;
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { shop: true, category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    // If no DB results and we have a keyword, try Yiwugo API
    if (items.length === 0 && q) {
      return this.syncFromYiwugo(q, page, pageSize);
    }

    const result: ProductSearchResult = {
      items: items.map((item: any) => this.mapDbProductToProduct(item)),
      total,
      page,
      pageSize,
    };

    await this.setCache(cacheKey, result, CACHE_TTL.SEARCH);
    return result;
  }

  /**
   * Get product detail by ID
   */
  async getProductDetail(id: string): Promise<Product> {
    const cacheKey = `product:detail:${id}`;
    const cached = await this.getCache<Product>(cacheKey);
    if (cached) return cached;

    // Try DB first by ID
    const dbProduct = await this.prisma.product.findUnique({
      where: { id },
      include: { shop: true, category: true },
    });

    if (dbProduct) {
      const product = this.mapDbProductToProduct(dbProduct);
      await this.setCache(cacheKey, product, CACHE_TTL.PRODUCT_DETAIL);
      return product;
    }

    // Try by yiwugoId
    const dbByYiwugoId = await this.prisma.product.findUnique({
      where: { yiwugoId: id },
      include: { shop: true, category: true },
    });

    if (dbByYiwugoId) {
      const product = this.mapDbProductToProduct(dbByYiwugoId);
      await this.setCache(cacheKey, product, CACHE_TTL.PRODUCT_DETAIL);
      return product;
    }

    // Fallback: fetch from Yiwugo API and translate
    try {
      const rawProduct = await this.yiwugoApiClient.getProductDetail(id);
      const product = await this.convertYiwugoProductToProduct(rawProduct);
      await this.setCache(cacheKey, product, CACHE_TTL.PRODUCT_DETAIL);
      return product;
    } catch (error) {
      this.logger.error(`Failed to get product detail for id=${id}`, error);
      throw new NotFoundException('상품을 찾을 수 없습니다.');
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(
    categoryId: string,
    page = 1,
    pageSize = 20,
  ): Promise<ProductSearchResult> {
    return this.searchProducts({
      category: categoryId,
      page,
      pageSize,
    });
  }

  /**
   * Get admin-featured products
   */
  async getFeaturedProducts(): Promise<Product[]> {
    const cacheKey = 'product:featured';
    const cached = await this.getCache<Product[]>(cacheKey);
    if (cached) return cached;

    const products = await this.prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { salesCount: 'desc' },
      take: 20,
      include: { shop: true, category: true },
    });

    const result = products.map((p: any) => this.mapDbProductToProduct(p));
    await this.setCache(cacheKey, result, CACHE_TTL.FEATURED);
    return result;
  }

  /**
   * Get popular products by view/sales count
   */
  async getPopularProducts(limit = 20): Promise<Product[]> {
    const cacheKey = `product:popular:${limit}`;
    const cached = await this.getCache<Product[]>(cacheKey);
    if (cached) return cached;

    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ salesCount: 'desc' }, { viewCount: 'desc' }],
      take: limit,
      include: { shop: true, category: true },
    });

    const result = products.map((p: any) => this.mapDbProductToProduct(p));
    await this.setCache(cacheKey, result, CACHE_TTL.POPULAR);
    return result;
  }

  /**
   * Increment view count for a product
   */
  async incrementViewCount(productId: string): Promise<void> {
    try {
      await this.prisma.product.update({
        where: { id: productId },
        data: { viewCount: { increment: 1 } },
      });
    } catch {
      // Product might be fetched from API and not in DB yet — ignore
      this.logger.debug(`Could not increment view count for ${productId}`);
    }
  }

  /**
   * Search products by image URL via Yiwugo API (not yet implemented in YiwugoApiClient)
   */
  async searchByImage(imageUrl: string): Promise<Product[]> {
    // This would require searchByImage method in YiwugoApiClient
    // For now, return empty array
    this.logger.warn('searchByImage not yet implemented');
    return [];
  }

  // ── Private helpers ────────────────────────────────────────

  /**
   * Sync products from Yiwugo API, translate, convert prices and store in DB
   */
  private async syncFromYiwugo(
    query: string,
    page: number,
    pageSize: number,
  ): Promise<ProductSearchResult> {
    try {
      // Search products via Yiwugo API
      const searchResult = await this.yiwugoApiClient.searchProducts({
        q: query,
        page,
        pageSize,
      });

      const rawProducts = searchResult.products || [];
      const total = searchResult.total || 0;

      if (rawProducts.length === 0) {
        return { items: [], total: 0, page, pageSize };
      }

      // Translate titles in batch
      const titles = rawProducts.map((p: any) => p.title || p.productName || '');
      const translatedTitles = await this.translationService.translateBatch(titles);

      // Convert to Product objects and store in DB
      const items: Product[] = [];
      const rate = await this.exchangeRateService.getCurrentRate();

      for (let idx = 0; idx < rawProducts.length; idx++) {
        const raw = rawProducts[idx];
        const product = await this.convertYiwugoProductToProduct(
          raw,
          translatedTitles[idx],
          rate.rate,
        );

        // Upsert into database
        try {
          const yiwugoId = raw.productId || raw.num_iid || String(idx);
          await this.prisma.product.upsert({
            where: { yiwugoId },
            update: {
              titleKo: product.titleKo,
              titleOriginal: product.titleOriginal,
              priceKrw: Number(product.priceKrw),
              priceOriginalCny: Number(product.priceOriginalCny),
              stock: product.stock,
              imageUrls: product.imageUrls,
              salesCount: product.salesCount,
              viewCount: product.viewCount,
              syncedAt: new Date(),
            },
            create: {
              yiwugoId,
              titleOriginal: product.titleOriginal,
              titleKo: product.titleKo,
              priceOriginalCny: Number(product.priceOriginalCny),
              priceKrw: Number(product.priceKrw),
              minOrderQty: product.minOrderQty,
              stock: product.stock,
              imageUrls: product.imageUrls,
              detailUrl: product.detailUrl,
              weight: product.weight,
              viewCount: product.viewCount,
              salesCount: product.salesCount,
              isActive: true,
              syncedAt: new Date(),
            },
          });
        } catch (error) {
          this.logger.error(`Failed to upsert product ${idx}`, error);
          // Continue with next product
        }

        items.push(product);
      }

      return {
        items,
        total,
        page,
        pageSize,
      };
    } catch (error) {
      this.logger.error(`Failed to sync products from Yiwugo for query="${query}"`, error);
      return { items: [], total: 0, page, pageSize };
    }
  }

  /**
   * Convert Yiwugo API product to Product object
   */
  private async convertYiwugoProductToProduct(
    rawProduct: any,
    translatedTitle?: string,
    exchangeRate?: number,
  ): Promise<Product> {
    const rate = exchangeRate ?? (await this.exchangeRateService.getCurrentRate()).rate;

    // Handle price conversion from 分 (cents) if needed
    let priceCny = 0;
    if (rawProduct.price !== undefined) {
      priceCny = typeof rawProduct.price === 'string'
        ? parseFloat(rawProduct.price)
        : Number(rawProduct.price);
    }
    // sellPrice from list API is in 分 (cents): value > 100 likely means cents
    if (rawProduct.sellPrice !== undefined) {
      const sellPrice = Number(rawProduct.sellPrice);
      if (sellPrice > 100) {
        priceCny = sellPrice / 100; // 分 → 元
      } else {
        priceCny = sellPrice;
      }
    }

    const priceKrw = Math.round(priceCny * rate);

    // Get title and translate if not provided
    const titleOriginal = rawProduct.title || rawProduct.productName || '';
    const titleKo = translatedTitle ||
      (titleOriginal ? await this.translationService.translate(titleOriginal) : '');

    // Get description and translate if provided
    const descOriginal = rawProduct.description || rawProduct.desc || undefined;
    const descKo = descOriginal
      ? await this.translationService.translateHtml(descOriginal)
      : undefined;

    // Extract image URLs
    const imageUrls = this.extractImageUrls(rawProduct);

    return {
      id: rawProduct.productId || rawProduct.num_iid || String(Math.random()),
      titleOriginal,
      titleKo,
      descOriginal,
      descKo,
      priceOriginalCny: String(priceCny),
      priceKrw: String(priceKrw),
      minOrderQty: rawProduct.minOrder || rawProduct.min_order_qty || 1,
      stock: rawProduct.stock || 0,
      imageUrls,
      categoryId: rawProduct.categoryId || rawProduct.category_id || undefined,
      subCategoryId: rawProduct.subCategoryId || rawProduct.sub_category_id || undefined,
      shopId: rawProduct.shopId || rawProduct.seller_id || undefined,
      shopName: rawProduct.shopName || rawProduct.shop_name || undefined,
      detailUrl: rawProduct.productUrl || rawProduct.detail_url || undefined,
      weight: rawProduct.weight || undefined,
      viewCount: rawProduct.viewCount || rawProduct.view_count || 0,
      salesCount: rawProduct.salesCount || rawProduct.sales_count || 0,
      wishlistCount: 0,
      reviewCount: 0,
      isActive: true,
      isFeatured: false,
      syncedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Extract image URLs from Yiwugo product object
   * Handles multiple possible formats from the API
   */
  private extractImageUrls(rawProduct: any): string[] {
    const images: string[] = [];

    // Handle item_imgs array
    if (Array.isArray(rawProduct.item_imgs)) {
      rawProduct.item_imgs.forEach((img: any) => {
        if (img.url) images.push(img.url);
      });
    }

    // Handle sdiProductsPicList array
    if (Array.isArray(rawProduct.sdiProductsPicList)) {
      rawProduct.sdiProductsPicList.forEach((img: any) => {
        if (img.url) images.push(img.url);
      });
    }

    // Handle single picUrl
    if (rawProduct.picUrl && images.length === 0) {
      images.push(rawProduct.picUrl);
    }

    // Handle productPicUrl
    if (rawProduct.productPicUrl && images.length === 0) {
      images.push(rawProduct.productPicUrl);
    }

    return images.length > 0 ? images : [];
  }

  private mapDbProductToProduct(dbProduct: any): Product {
    return {
      id: dbProduct.id,
      titleOriginal: dbProduct.titleOriginal,
      titleKo: dbProduct.titleKoManual || dbProduct.titleKo,
      titleKoManual: dbProduct.titleKoManual,
      descOriginal: dbProduct.descOriginal,
      descKo: dbProduct.descKo,
      priceOriginalCny: String(dbProduct.priceOriginalCny),
      priceKrw: String(dbProduct.priceKrw),
      originalPriceKrw: dbProduct.originalPriceKrw
        ? String(dbProduct.originalPriceKrw)
        : undefined,
      minOrderQty: dbProduct.minOrderQty,
      stock: dbProduct.stock,
      imageUrls: dbProduct.imageUrls ?? [],
      imageProxyUrls: dbProduct.imageProxyUrls,
      categoryId: dbProduct.categoryId,
      subCategoryId: dbProduct.subCategoryId,
      shopId: dbProduct.shopId,
      shopName: dbProduct.shop?.nameOriginal,
      shopNameKo: dbProduct.shop?.nameKo,
      detailUrl: dbProduct.detailUrl,
      options: dbProduct.options as any,
      optionsKo: dbProduct.optionsKo as any,
      specs: dbProduct.specs as any,
      specsKo: dbProduct.specsKo as any,
      weight: dbProduct.weight,
      viewCount: dbProduct.viewCount,
      salesCount: dbProduct.salesCount,
      wishlistCount: dbProduct.wishlistCount,
      reviewCount: dbProduct.reviewCount,
      averageRating: dbProduct.averageRating,
      isActive: dbProduct.isActive,
      isFeatured: dbProduct.isFeatured,
      syncedAt: dbProduct.syncedAt.toISOString(),
      createdAt: dbProduct.createdAt.toISOString(),
      updatedAt: dbProduct.updatedAt.toISOString(),
    };
  }

  private async getCache<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redisService.get(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      // ignore cache errors
    }
    return null;
  }

  private async setCache<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      await this.redisService.set(key, JSON.stringify(data), ttl);
    } catch {
      // ignore cache errors
    }
  }
}
