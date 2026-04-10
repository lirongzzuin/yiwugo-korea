import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { RedisService } from '@common/services/redis.service';
import {
  MeilisearchService,
  MeiliProductDocument,
  MeiliSearchResult,
} from './meilisearch.service';

const POPULAR_KEYWORDS_KEY = 'search:popular-keywords';
const POPULAR_KEYWORDS_TTL = 600; // 10 minutes
const AUTOCOMPLETE_CACHE_TTL = 300; // 5 minutes

export interface SearchFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly meilisearchService: MeilisearchService,
  ) {}

  /**
   * Full-text search using Meilisearch
   */
  async search(
    query: string,
    filters: SearchFilters = {},
    page = 1,
    pageSize = 20,
  ): Promise<MeiliSearchResult> {
    const meiliFilters: string[] = [];
    const meiliSort: string[] = [];

    if (filters.categoryId) {
      meiliFilters.push(`categoryId = "${filters.categoryId}"`);
    }

    if (filters.minPrice !== undefined) {
      meiliFilters.push(`priceKrw >= ${filters.minPrice}`);
    }

    if (filters.maxPrice !== undefined) {
      meiliFilters.push(`priceKrw <= ${filters.maxPrice}`);
    }

    switch (filters.sortBy) {
      case 'price_asc':
        meiliSort.push('priceKrw:asc');
        break;
      case 'price_desc':
        meiliSort.push('priceKrw:desc');
        break;
      case 'sales':
        meiliSort.push('salesCount:desc');
        break;
      case 'newest':
        meiliSort.push('syncedAt:desc');
        break;
      default:
        // relevance (default Meilisearch ranking)
        break;
    }

    // Track the search keyword
    if (query && query.trim().length > 0) {
      this.trackSearch(query.trim()).catch(() => {});
    }

    return this.meilisearchService.search({
      query,
      page,
      pageSize,
      filter: meiliFilters,
      sort: meiliSort,
    });
  }

  /**
   * Autocomplete suggestions from Meilisearch
   */
  async getAutoComplete(prefix: string): Promise<string[]> {
    if (!prefix || prefix.trim().length < 1) return [];

    const cacheKey = `search:autocomplete:${prefix.toLowerCase()}`;
    try {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }

    // Search with small limit to get suggestions
    const result = await this.meilisearchService.search({
      query: prefix,
      pageSize: 10,
    });

    // Extract unique title snippets for suggestions
    const suggestions = Array.from(
      new Set(
        result.hits.map((hit) => hit.titleKo).filter(Boolean),
      ),
    ).slice(0, 8);

    try {
      await this.redisService.set(
        cacheKey,
        JSON.stringify(suggestions),
        AUTOCOMPLETE_CACHE_TTL,
      );
    } catch {
      // ignore
    }

    return suggestions;
  }

  /**
   * Get popular search keywords (from Redis sorted set)
   */
  async getPopularKeywords(limit = 10): Promise<string[]> {
    try {
      const cached = await this.redisService.get(
        `${POPULAR_KEYWORDS_KEY}:cached`,
      );
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }

    // Fallback: get from Redis sorted set keys pattern
    // Since RedisService is basic, we track keywords with individual keys
    // and maintain a top-N list periodically
    // For now, return from DB if we stored popular keywords there
    // or return a static list as fallback
    const fallback = [
      '가방',
      '주방용품',
      '핸드폰케이스',
      '악세사리',
      '완구',
      '문구',
      '인테리어',
      '수납',
      '반려동물',
      '의류',
    ];

    return fallback.slice(0, limit);
  }

  /**
   * Track a search keyword for popularity ranking
   * Uses Redis to increment keyword counts
   */
  async trackSearch(keyword: string): Promise<void> {
    const normalized = keyword.trim().toLowerCase();
    if (normalized.length === 0) return;

    try {
      const key = `search:keyword:${normalized}`;
      await this.redisService.incr(key);
      // Set TTL of 30 days on keyword count
      await this.redisService.expire(key, 2592000);
    } catch {
      // ignore tracking errors
    }
  }

  /**
   * Reindex all products from DB to Meilisearch
   */
  async reindexProducts(): Promise<{ indexed: number }> {
    this.logger.log('Starting full product reindex...');

    // Clear existing index
    await this.meilisearchService.clearIndex();

    // Fetch all active products from DB
    const batchSize = 500;
    let skip = 0;
    let totalIndexed = 0;

    while (true) {
      const products = await this.prisma.product.findMany({
        where: { isActive: true },
        include: { shop: true },
        skip,
        take: batchSize,
        orderBy: { createdAt: 'asc' },
      });

      if (products.length === 0) break;

      const docs: MeiliProductDocument[] = products.map((p: any) => ({
        id: p.id,
        titleKo: p.titleKo,
        titleOriginal: p.titleOriginal,
        descKo: p.descKo ?? undefined,
        shopNameKo: p.shop?.nameKo,
        shopNameOriginal: p.shop?.nameOriginal,
        categoryId: p.categoryId ?? undefined,
        priceKrw: Number(p.priceKrw),
        priceOriginalCny: Number(p.priceOriginalCny),
        minOrderQty: p.minOrderQty,
        salesCount: p.salesCount,
        viewCount: p.viewCount,
        wishlistCount: p.wishlistCount,
        reviewCount: p.reviewCount,
        averageRating: p.averageRating,
        imageUrl:
          p.imageProxyUrls?.[0] ?? p.imageUrls?.[0] ?? null,
        isActive: p.isActive,
        isFeatured: p.isFeatured,
        syncedAt: p.syncedAt.getTime(),
      }));

      await this.meilisearchService.indexProducts(docs);
      totalIndexed += docs.length;
      skip += batchSize;

      this.logger.log(`Reindexed ${totalIndexed} products so far...`);
    }

    this.logger.log(`Reindex complete. Total indexed: ${totalIndexed}`);
    return { indexed: totalIndexed };
  }
}
