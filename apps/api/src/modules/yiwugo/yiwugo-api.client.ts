import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';
import { RedisService } from '@common/services/redis.service';
import { YiwugoRawProduct, YiwugoRawShop } from '@yiwugo/shared';

const CACHE_TTL = {
  SEARCH: 1800, // 30 minutes
  PRODUCT_DETAIL: 7200, // 2 hours
  SHOP_INFO: 21600, // 6 hours
  STALE_FALLBACK: 86400, // 24 hours — stale cache kept as fallback
};

const RATE_LIMIT = {
  PER_SECOND: 5,
  PER_MINUTE: 100,
};

const MAX_RETRIES = 3;
const REQUEST_TIMEOUT_MS = 10_000;

@Injectable()
export class YiwugoApiClient {
  private readonly logger = new Logger(YiwugoApiClient.name);
  private readonly apiBaseUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly mockMode: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.apiBaseUrl = this.configService.get<string>(
      'YIWUGO_API_BASE_URL',
      'https://api.yiwugo.com',
    );
    this.apiKey = this.configService.get<string>('YIWUGO_API_KEY', '');
    this.apiSecret = this.configService.get<string>('YIWUGO_API_SECRET', '');
    this.mockMode =
      this.configService.get<string>('YIWUGO_MOCK_MODE', 'false') === 'true';
  }

  /**
   * Search products by keyword
   */
  async searchProducts(
    query: string,
    page = 1,
    pageSize = 20,
  ): Promise<YiwugoRawProduct[]> {
    if (this.mockMode) {
      return this.getMockData('search');
    }

    const cacheKey = `yiwugo:search:${this.hash(`${query}:${page}:${pageSize}`)}`;

    // Check cache
    const cached = await this.getCache<YiwugoRawProduct[]>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.apiBaseUrl}/item_search`;
      const data = await this.request<{ items: YiwugoRawProduct[] }>(url, {
        q: query,
        start_price: '',
        end_price: '',
        page: String(page),
        page_size: String(pageSize),
        key: this.apiKey,
        secret: this.apiSecret,
        lang: 'zh-CN',
      });

      const items = data?.items ?? [];
      await this.setCache(cacheKey, items, CACHE_TTL.SEARCH);
      return items;
    } catch (error) {
      this.logger.error(`searchProducts failed for query="${query}"`, error);
      // Fallback to stale cache
      const stale = await this.getStaleCache<YiwugoRawProduct[]>(cacheKey);
      if (stale) {
        this.logger.warn('Returning stale cache for searchProducts');
        return stale;
      }
      throw error;
    }
  }

  /**
   * Get product detail by num_iid
   */
  async getProductDetail(numIid: string): Promise<YiwugoRawProduct> {
    if (this.mockMode) {
      const mock = this.getMockData('detail');
      return mock[0];
    }

    const cacheKey = `yiwugo:product:${numIid}`;

    const cached = await this.getCache<YiwugoRawProduct>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.apiBaseUrl}/item_get`;
      const data = await this.request<{ item: YiwugoRawProduct }>(url, {
        num_iid: numIid,
        key: this.apiKey,
        secret: this.apiSecret,
      });

      const item = data?.item;
      if (!item) {
        throw new Error(`Product not found: ${numIid}`);
      }

      await this.setCache(cacheKey, item, CACHE_TTL.PRODUCT_DETAIL);
      return item;
    } catch (error) {
      this.logger.error(`getProductDetail failed for numIid="${numIid}"`, error);
      const stale = await this.getStaleCache<YiwugoRawProduct>(cacheKey);
      if (stale) {
        this.logger.warn('Returning stale cache for getProductDetail');
        return stale;
      }
      throw error;
    }
  }

  /**
   * Search products by image URL
   */
  async searchByImage(imageUrl: string): Promise<YiwugoRawProduct[]> {
    if (this.mockMode) {
      return this.getMockData('search');
    }

    const cacheKey = `yiwugo:img-search:${this.hash(imageUrl)}`;

    const cached = await this.getCache<YiwugoRawProduct[]>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.apiBaseUrl}/item_search_img`;
      const data = await this.request<{ items: YiwugoRawProduct[] }>(url, {
        imgid: imageUrl,
        key: this.apiKey,
        secret: this.apiSecret,
      });

      const items = data?.items ?? [];
      await this.setCache(cacheKey, items, CACHE_TTL.SEARCH);
      return items;
    } catch (error) {
      this.logger.error('searchByImage failed', error);
      const stale = await this.getStaleCache<YiwugoRawProduct[]>(cacheKey);
      if (stale) return stale;
      throw error;
    }
  }

  /**
   * Get shop/seller info
   */
  async getShopInfo(sellerId: string): Promise<YiwugoRawShop> {
    if (this.mockMode) {
      return this.getMockData('shop') as unknown as YiwugoRawShop;
    }

    const cacheKey = `yiwugo:shop:${sellerId}`;

    const cached = await this.getCache<YiwugoRawShop>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.apiBaseUrl}/seller_info`;
      const data = await this.request<{ seller: YiwugoRawShop }>(url, {
        seller_id: sellerId,
        key: this.apiKey,
        secret: this.apiSecret,
      });

      const seller = data?.seller;
      if (!seller) {
        throw new Error(`Shop not found: ${sellerId}`);
      }

      await this.setCache(cacheKey, seller, CACHE_TTL.SHOP_INFO);
      return seller;
    } catch (error) {
      this.logger.error(
        `getShopInfo failed for sellerId="${sellerId}"`,
        error,
      );
      const stale = await this.getStaleCache<YiwugoRawShop>(cacheKey);
      if (stale) return stale;
      throw error;
    }
  }

  // ── Private helpers ──────────────────────────────────────

  /**
   * Execute an HTTP GET request with rate limiting and retry logic
   */
  private async request<T>(
    url: string,
    params: Record<string, string>,
    attempt = 1,
  ): Promise<T> {
    await this.checkRateLimit();

    try {
      const response = await axios.get<T>(url, {
        params,
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'YiwugoKorea/1.0',
        },
      });

      await this.recordRateLimit();
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;

      // Retry on 429 (rate limited) or 5xx (server error)
      if (attempt < MAX_RETRIES && (status === 429 || (status && status >= 500))) {
        const delay = Math.pow(2, attempt) * 500; // 1s, 2s, 4s
        this.logger.warn(
          `Request failed (status=${status}), retrying in ${delay}ms (attempt ${attempt}/${MAX_RETRIES})`,
        );
        await this.sleep(delay);
        return this.request<T>(url, params, attempt + 1);
      }

      throw error;
    }
  }

  /**
   * Token bucket rate limiter backed by Redis
   */
  private async checkRateLimit(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const secKey = `yiwugo:ratelimit:sec:${now}`;
    const minKey = `yiwugo:ratelimit:min:${Math.floor(now / 60)}`;

    const [secCount, minCount] = await Promise.all([
      this.redisService.get(secKey).then((v) => parseInt(v || '0', 10)),
      this.redisService.get(minKey).then((v) => parseInt(v || '0', 10)),
    ]);

    if (secCount >= RATE_LIMIT.PER_SECOND) {
      this.logger.warn('Per-second rate limit reached, waiting 1s');
      await this.sleep(1000);
    }

    if (minCount >= RATE_LIMIT.PER_MINUTE) {
      const waitMs = (60 - (now % 60)) * 1000;
      this.logger.warn(`Per-minute rate limit reached, waiting ${waitMs}ms`);
      await this.sleep(waitMs);
    }
  }

  private async recordRateLimit(): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const secKey = `yiwugo:ratelimit:sec:${now}`;
    const minKey = `yiwugo:ratelimit:min:${Math.floor(now / 60)}`;

    await Promise.all([
      this.redisService.incr(secKey).then(() => this.redisService.expire(secKey, 2)),
      this.redisService.incr(minKey).then(() => this.redisService.expire(minKey, 61)),
    ]);
  }

  private async getCache<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redisService.get(key);
      if (raw) return JSON.parse(raw) as T;
    } catch (error) {
      this.logger.warn(`Cache read error for key="${key}"`, error);
    }
    return null;
  }

  private async setCache<T>(key: string, data: T, ttl: number): Promise<void> {
    try {
      const json = JSON.stringify(data);
      await Promise.all([
        this.redisService.set(key, json, ttl),
        // Also set a stale copy with longer TTL for fallback
        this.redisService.set(`${key}:stale`, json, CACHE_TTL.STALE_FALLBACK),
      ]);
    } catch (error) {
      this.logger.warn(`Cache write error for key="${key}"`, error);
    }
  }

  private async getStaleCache<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redisService.get(`${key}:stale`);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      // ignore stale cache errors
    }
    return null;
  }

  private hash(input: string): string {
    return crypto.createHash('md5').update(input).digest('hex');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Return mock data for development/testing
   */
  private getMockData(type: string): YiwugoRawProduct[] {
    const mockProducts: YiwugoRawProduct[] = [
      {
        num_iid: 'MOCK001',
        title: '2024新款时尚女包手提包大容量单肩包',
        price: '25.00',
        pic_url: 'https://img.yiwugo.com/mock/bag1.jpg',
        detail_url: 'https://www.yiwugo.com/product/MOCK001',
        props_name: '颜色:黑色;尺寸:大号',
        seller_id: 'S10001',
        seller_nick: '义乌箱包批发',
        shop_name: '义乌箱包批发商行',
        booth_number: '1-A-001',
        category_id: 'bags',
        min_order_qty: 2,
        stock: 5000,
        weight: '0.5kg',
        item_imgs: [{ url: 'https://img.yiwugo.com/mock/bag1.jpg' }],
        sales_count: 12500,
        view_count: 88000,
      },
      {
        num_iid: 'MOCK002',
        title: '不锈钢保温杯便携水杯大容量500ml',
        price: '8.50',
        pic_url: 'https://img.yiwugo.com/mock/cup1.jpg',
        detail_url: 'https://www.yiwugo.com/product/MOCK002',
        props_name: '颜色:银色;容量:500ml',
        seller_id: 'S10002',
        seller_nick: '日用百货直销',
        shop_name: '义乌日用百货批发',
        booth_number: '2-B-015',
        category_id: 'household',
        min_order_qty: 10,
        stock: 20000,
        weight: '0.3kg',
        item_imgs: [{ url: 'https://img.yiwugo.com/mock/cup1.jpg' }],
        sales_count: 45000,
        view_count: 120000,
      },
    ];

    if (type === 'detail') {
      return [
        {
          ...mockProducts[0],
          desc: '<p>高品质时尚女包，大容量设计，适合日常出行。面料柔软，做工精细。厂家直销，一件代发。</p>',
          sku_list: [
            { sku_id: 'SKU001', properties_name: '颜色:黑色', price: '25.00', quantity: 2000 },
            { sku_id: 'SKU002', properties_name: '颜色:棕色', price: '25.00', quantity: 1500 },
            { sku_id: 'SKU003', properties_name: '颜色:红色', price: '28.00', quantity: 1500 },
          ],
          prop_imgs: [
            { properties: '颜色:黑色', url: 'https://img.yiwugo.com/mock/bag1_black.jpg' },
            { properties: '颜色:棕色', url: 'https://img.yiwugo.com/mock/bag1_brown.jpg' },
          ],
        },
      ];
    }

    if (type === 'shop') {
      return [{
        num_iid: '',
        title: '',
        price: '0',
        pic_url: '',
        detail_url: '',
        props_name: '',
        seller_id: 'S10001',
        seller_nick: '义乌箱包批发',
        shop_name: '义乌箱包批发商行',
        booth_number: '1-A-001',
      }] as unknown as YiwugoRawProduct[];
    }

    return mockProducts;
  }
}
