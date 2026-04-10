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
      return this.searchFromYiwugo(q, page, pageSize);
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

    // Try DB first
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

    // Fallback: fetch from Yiwugo API
    try {
      const rawProduct = await this.yiwugoApiClient.getProductDetail(id);
      const rate = await this.exchangeRateService.getCurrentRate();
      const titleKo = await this.translationService.translate(rawProduct.title);
      const descKo = rawProduct.desc
        ? await this.translationService.translateHtml(rawProduct.desc)
        : undefined;

      const priceCny = parseFloat(rawProduct.price);
      const priceKrw = Math.round(priceCny * rate.rate);

      const product: Product = {
        id: rawProduct.num_iid,
        titleOriginal: rawProduct.title,
        titleKo,
        descOriginal: rawProduct.desc,
        descKo,
        priceOriginalCny: rawProduct.price,
        priceKrw: String(priceKrw),
        minOrderQty: rawProduct.min_order_qty ?? 1,
        stock: rawProduct.stock,
        imageUrls: rawProduct.item_imgs?.map((img) => img.url) ?? [rawProduct.pic_url],
        categoryId: rawProduct.category_id,
        subCategoryId: rawProduct.sub_category_id,
        shopId: rawProduct.seller_id,
        shopName: rawProduct.shop_name,
        detailUrl: rawProduct.detail_url,
        weight: rawProduct.weight,
        viewCount: rawProduct.view_count ?? 0,
        salesCount: rawProduct.sales_count ?? 0,
        wishlistCount: 0,
        reviewCount: 0,
        isActive: true,
        isFeatured: false,
        syncedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

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
   * Search products by image URL via Yiwugo API
   */
  async searchByImage(imageUrl: string): Promise<Product[]> {
    const rawProducts = await this.yiwugoApiClient.searchByImage(imageUrl);
    const rate = await this.exchangeRateService.getCurrentRate();

    const titles = rawProducts.map((p) => p.title);
    const translatedTitles = await this.translationService.translateBatch(titles);

    return rawProducts.map((raw, idx) => {
      const priceCny = parseFloat(raw.price);
      const priceKrw = Math.round(priceCny * rate.rate);

      return {
        id: raw.num_iid,
        titleOriginal: raw.title,
        titleKo: translatedTitles[idx],
        priceOriginalCny: raw.price,
        priceKrw: String(priceKrw),
        minOrderQty: raw.min_order_qty ?? 1,
        stock: raw.stock,
        imageUrls: raw.item_imgs?.map((img) => img.url) ?? [raw.pic_url],
        categoryId: raw.category_id,
        shopId: raw.seller_id,
        shopName: raw.shop_name,
        detailUrl: raw.detail_url,
        weight: raw.weight,
        viewCount: raw.view_count ?? 0,
        salesCount: raw.sales_count ?? 0,
        wishlistCount: 0,
        reviewCount: 0,
        isActive: true,
        isFeatured: false,
        syncedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
  }

  // ── Private helpers ────────────────────────────────────────

  /**
   * Search from Yiwugo API, translate and convert prices
   */
  private async searchFromYiwugo(
    query: string,
    page: number,
    pageSize: number,
  ): Promise<ProductSearchResult> {
    const rawProducts = await this.yiwugoApiClient.searchProducts(query, page, pageSize);
    const rate = await this.exchangeRateService.getCurrentRate();

    const titles = rawProducts.map((p) => p.title);
    const translatedTitles = await this.translationService.translateBatch(titles);

    const items: Product[] = rawProducts.map((raw, idx) => {
      const priceCny = parseFloat(raw.price);
      const priceKrw = Math.round(priceCny * rate.rate);

      return {
        id: raw.num_iid,
        titleOriginal: raw.title,
        titleKo: translatedTitles[idx],
        priceOriginalCny: raw.price,
        priceKrw: String(priceKrw),
        minOrderQty: raw.min_order_qty ?? 1,
        stock: raw.stock,
        imageUrls: raw.item_imgs?.map((img) => img.url) ?? [raw.pic_url],
        categoryId: raw.category_id,
        shopId: raw.seller_id,
        shopName: raw.shop_name,
        detailUrl: raw.detail_url,
        weight: raw.weight,
        viewCount: raw.view_count ?? 0,
        salesCount: raw.sales_count ?? 0,
        wishlistCount: 0,
        reviewCount: 0,
        isActive: true,
        isFeatured: false,
        syncedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    return {
      items,
      total: items.length,
      page,
      pageSize,
    };
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
