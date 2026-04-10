import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import * as crypto from 'crypto';
import { RedisService } from '@common/services/redis.service';
// Uses 'any' for raw API responses to avoid tight coupling with shared types

const CACHE_TTL = {
  TOKEN: 19000, // 19000s (slightly less than the 20000s API response)
  SEARCH: 1800, // 30 minutes
  PRODUCT_DETAIL: 7200, // 2 hours
  SHOP_INFO: 21600, // 6 hours
  CATEGORIES: 86400, // 24 hours
  MARKETS: 86400, // 24 hours
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
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly mockMode: boolean;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.apiBaseUrl = this.configService.get<string>(
      'YIWUGO_API_BASE_URL',
      'https://www.yiwugo.com',
    );
    this.clientId = this.configService.get<string>('YIWUGO_CLIENT_ID', '');
    this.clientSecret = this.configService.get<string>('YIWUGO_CLIENT_SECRET', '');
    this.mockMode =
      this.configService.get<string>('YIWUGO_MOCK_MODE', 'false') === 'true';
  }

  /**
   * Get OAuth token using client credentials grant (POST method)
   * Token is cached in Redis with TTL slightly less than expiresIn
   * API Doc: POST /oauth/token
   */
  async getToken(): Promise<string> {
    const cacheKey = 'yiwugo:token:access';

    // Try to get cached token
    const cached = await this.getCache<string>(cacheKey);
    if (cached) return cached;

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const url = `${this.apiBaseUrl}/oauth/token`;

      await this.checkRateLimit();
      const response = await axios.post(url, null, {
        params: {
          grant_type: 'client_credentials',
          client_id: this.clientId,
        },
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
        timeout: REQUEST_TIMEOUT_MS,
      });
      await this.recordRateLimit();

      const body = response.data;
      if (!body?.data?.accessToken) {
        throw new Error('Invalid token response: missing accessToken');
      }

      const token = body.data.accessToken;
      const expiresIn = body.data.expiresIn || 20000;

      // Cache with TTL slightly less than expiresIn to avoid using expired tokens
      await this.setCache(cacheKey, token, Math.max(CACHE_TTL.TOKEN, expiresIn - 1000));
      return token;
    } catch (error) {
      this.logger.error('Failed to get OAuth token', error);
      throw error;
    }
  }

  /**
   * Get product categories/classifications
   */
  async getCategories(
    upperType?: string,
    webType: string = 'cn',
  ): Promise<any> {
    if (this.mockMode) {
      return this.getMockCategories();
    }

    const cacheKey = `yiwugo:categories:${webType}${upperType ? `:${upperType}` : ''}`;

    // Check cache
    const cached = await this.getCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const token = await this.getToken();
      const url = `${this.apiBaseUrl}/open/categorize/product`;

      const params: Record<string, string> = {
        access_token: token,
        webType,
      };
      if (upperType) {
        params.upperType = upperType;
      }

      const data = await this.request<any>(url, params);

      const categories = data?.data?.list ?? [];
      await this.setCache(cacheKey, categories, CACHE_TTL.CATEGORIES);
      return categories;
    } catch (error) {
      this.logger.error(`getCategories failed for webType="${webType}"`, error);
      const stale = await this.getStaleCache<any>(cacheKey);
      if (stale) {
        this.logger.warn('Returning stale cache for getCategories');
        return stale;
      }
      throw error;
    }
  }

  /**
   * Get market list
   */
  async getMarkets(): Promise<any> {
    if (this.mockMode) {
      return this.getMockMarkets();
    }

    const cacheKey = 'yiwugo:markets';

    // Check cache
    const cached = await this.getCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const token = await this.getToken();
      const url = `${this.apiBaseUrl}/open/categorize/market`;

      const data = await this.request<any>(url, {
        access_token: token,
      });

      const markets = data?.data?.marketList ?? [];
      await this.setCache(cacheKey, markets, CACHE_TTL.MARKETS);
      return markets;
    } catch (error) {
      this.logger.error('getMarkets failed', error);
      const stale = await this.getStaleCache<any>(cacheKey);
      if (stale) {
        this.logger.warn('Returning stale cache for getMarkets');
        return stale;
      }
      throw error;
    }
  }

  /**
   * Search shops by keyword and filters
   */
  async searchShops(params: {
    q?: string;
    page?: number;
    number?: number;
    subMarket?: string;
    subFloor?: string;
  }): Promise<any> {
    if (this.mockMode) {
      return this.getMockShops();
    }

    const cacheKey = `yiwugo:shops:${this.hash(JSON.stringify(params))}`;

    // Check cache
    const cached = await this.getCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const token = await this.getToken();
      const url = `${this.apiBaseUrl}/open/cn_shop/list`;

      const queryParams: Record<string, string> = {
        access_token: token,
        type: '2', // Fixed type for shop search
      };

      if (params.q) queryParams.q = params.q;
      if (params.page) queryParams.page = String(params.page);
      if (params.number) queryParams.number = String(params.number);
      if (params.subMarket) queryParams.subMarket = params.subMarket;
      if (params.subFloor) queryParams.subFloor = params.subFloor;

      const data = await this.request<any>(url, queryParams);

      const result = {
        total: data?.data?.num ?? 0,
        shops: data?.data?.list ?? [],
      };

      await this.setCache(cacheKey, result, CACHE_TTL.SEARCH);
      return result;
    } catch (error) {
      this.logger.error('searchShops failed', error);
      const stale = await this.getStaleCache<any>(cacheKey);
      if (stale) {
        this.logger.warn('Returning stale cache for searchShops');
        return stale;
      }
      throw error;
    }
  }

  /**
   * Get shop detail by shopId
   */
  async getShopDetail(shopId: string): Promise<any> {
    if (this.mockMode) {
      return this.getMockShopDetail();
    }

    const cacheKey = `yiwugo:shop-detail:${shopId}`;

    const cached = await this.getCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const token = await this.getToken();
      const url = `${this.apiBaseUrl}/open/cn_shop/detail`;

      const data = await this.request<any>(url, {
        access_token: token,
        shopId,
      });

      const detail = data?.data?.shopdetail ?? data?.data;
      if (!detail) {
        throw new Error(`Shop not found: ${shopId}`);
      }

      await this.setCache(cacheKey, detail, CACHE_TTL.SHOP_INFO);
      return detail;
    } catch (error) {
      this.logger.error(`getShopDetail failed for shopId="${shopId}"`, error);
      const stale = await this.getStaleCache<any>(cacheKey);
      if (stale) {
        this.logger.warn('Returning stale cache for getShopDetail');
        return stale;
      }
      throw error;
    }
  }

  /**
   * Search products by keyword and filters
   * API Doc: GET /open/cn_product/list
   * Params: q, cpage, pageSize, m (market), f (floor), shopId,
   *         productLable, beginNumber, stp, edp, st (sort),
   *         goodLabelFlag, onlineOrderFlag, access_token
   */
  async searchProducts(params: {
    q?: string;
    page?: number;
    pageSize?: number;
    m?: string;          // 시장코드 (Market code, e.g. 1004)
    f?: string;          // 층 (Floor)
    shopId?: string;
    productLabel?: string; // 112=일건대발, 113=포우, 2=전공출구, 4=수입관, 1=인기
    beginNumber?: number;  // 최소 주문 수량
    minPrice?: number;     // 최저 가격 (stp)
    maxPrice?: number;     // 최고 가격 (edp)
    sort?: number;         // 9=판매량↓, 3=가격↓, 4=가격↑, 11=최소주문량↑
    goodLabelFlag?: string; // 인기상품=1
    onlineOrderFlag?: string; // 온라인 구매 지원
  }): Promise<any> {
    if (this.mockMode) {
      return this.getMockData('search');
    }

    const cacheKey = `yiwugo:products:${this.hash(JSON.stringify(params))}`;

    // Check cache
    const cached = await this.getCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const token = await this.getToken();
      const url = `${this.apiBaseUrl}/open/cn_product/list`;

      const queryParams: Record<string, string> = {
        access_token: token,
      };

      if (params.q) queryParams.q = params.q;
      if (params.page) queryParams.cpage = String(params.page);
      if (params.pageSize) queryParams.pageSize = String(params.pageSize);
      if (params.m) queryParams.m = params.m;
      if (params.f) queryParams.f = params.f;
      if (params.shopId) queryParams.shopId = params.shopId;
      if (params.productLabel) queryParams.productLable = params.productLabel;
      if (params.beginNumber) queryParams.beginNumber = String(params.beginNumber);
      if (params.minPrice !== undefined) queryParams.stp = String(params.minPrice);
      if (params.maxPrice !== undefined) queryParams.edp = String(params.maxPrice);
      if (params.sort) queryParams.st = String(params.sort);
      if (params.goodLabelFlag) queryParams.goodLabelFlag = params.goodLabelFlag;
      if (params.onlineOrderFlag) queryParams.onlineOrderFlag = params.onlineOrderFlag;

      const data = await this.request<any>(url, queryParams);

      // API 응답의 상품 목록 키가 버전에 따라 다를 수 있음
      const products = data?.data?.adShopTreoughTrainList
        ?? data?.data?.prslist
        ?? [];

      const result = {
        total: data?.data?.numfound ?? 0,
        products,
        subMarketList: data?.data?.subMarketList ?? [],
        categoryList: data?.data?.categoryList ?? [],
      };

      await this.setCache(cacheKey, result, CACHE_TTL.SEARCH);
      return result;
    } catch (error) {
      this.logger.error('searchProducts failed', error);
      // Fallback to stale cache
      const stale = await this.getStaleCache<any>(cacheKey);
      if (stale) {
        this.logger.warn('Returning stale cache for searchProducts');
        return stale;
      }
      throw error;
    }
  }

  /**
   * Get product detail by productId
   */
  async getProductDetail(productId: string): Promise<any> {
    if (this.mockMode) {
      const mock = this.getMockData('detail');
      return mock[0];
    }

    const cacheKey = `yiwugo:product:${productId}`;

    const cached = await this.getCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const token = await this.getToken();
      const url = `${this.apiBaseUrl}/open/cn_product/detail`;

      const data = await this.request<any>(url, {
        access_token: token,
        productId,
      });

      const detail = data?.data?.detail ?? data?.data;
      if (!detail) {
        throw new Error(`Product not found: ${productId}`);
      }

      await this.setCache(cacheKey, detail, CACHE_TTL.PRODUCT_DETAIL);
      return detail;
    } catch (error) {
      this.logger.error(`getProductDetail failed for productId="${productId}"`, error);
      const stale = await this.getStaleCache<any>(cacheKey);
      if (stale) {
        this.logger.warn('Returning stale cache for getProductDetail');
        return stale;
      }
      throw error;
    }
  }

  /**
   * Get shop internal category product counts
   * API Doc: GET /open/cn_shop/shopCategorizeNum
   * 상점 내부 카테고리별 상품 수량 조회
   *
   * @param shopId - 상점 ID
   * @returns { typeProducts: [{ defineType: number, productNums: number }] }
   */
  async getShopCategorizeNum(shopId: string): Promise<any> {
    if (this.mockMode) {
      return { typeProducts: [{ defineType: 503005, productNums: 100 }] };
    }

    const cacheKey = `yiwugo:shop-categories:${shopId}`;

    const cached = await this.getCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const token = await this.getToken();
      const url = `${this.apiBaseUrl}/open/cn_shop/shopCategorizeNum`;

      const data = await this.request<any>(url, {
        access_token: token,
        shopId,
      });

      const result = data?.data ?? { typeProducts: [] };
      await this.setCache(cacheKey, result, CACHE_TTL.SHOP_INFO);
      return result;
    } catch (error) {
      this.logger.error(`getShopCategorizeNum failed for shopId="${shopId}"`, error);
      const stale = await this.getStaleCache<any>(cacheKey);
      if (stale) {
        this.logger.warn('Returning stale cache for getShopCategorizeNum');
        return stale;
      }
      throw error;
    }
  }

  /**
   * Search products within a specific shop
   * API Doc: GET /open/cn_shop/shopSearch
   * 상점 내부 상품 검색
   *
   * @param params.shopId - 상점 ID (필수)
   * @param params.keyword - 검색어
   * @param params.productLable - 112=일건대발
   * @param params.dt - 필터
   * @param params.st - 정렬: 1=최신, 9=판매량, 4=가격순, 3=가격역순
   * @param params.cpage - 페이지 번호
   * @param params.pagesize - 페이지당 수량
   */
  async searchShopProducts(params: {
    shopId: string;
    keyword?: string;
    productLable?: string;
    dt?: string;
    st?: string;  // 1=최신, 9=판매량, 4=가격↑, 3=가격↓
    cpage?: number;
    pagesize?: number;
  }): Promise<any> {
    if (this.mockMode) {
      return {
        shopName: 'Mock Shop',
        pageSize: 10,
        productdetaillist: [],
      };
    }

    const cacheKey = `yiwugo:shop-search:${this.hash(JSON.stringify(params))}`;

    const cached = await this.getCache<any>(cacheKey);
    if (cached) return cached;

    try {
      const token = await this.getToken();
      const url = `${this.apiBaseUrl}/open/cn_shop/shopSearch`;

      const queryParams: Record<string, string> = {
        access_token: token,
        shopId: params.shopId,
      };

      if (params.keyword) queryParams.keyword = params.keyword;
      if (params.productLable) queryParams.productLable = params.productLable;
      if (params.dt) queryParams.dt = params.dt;
      if (params.st) queryParams.st = params.st;
      if (params.cpage) queryParams.cpage = String(params.cpage);
      if (params.pagesize) queryParams.pagesize = String(params.pagesize);

      const data = await this.request<any>(url, queryParams);

      const result = {
        shopName: data?.data?.shopName ?? '',
        pageSize: data?.data?.pageSize ?? 10,
        products: data?.data?.productdetaillist ?? [],
      };

      await this.setCache(cacheKey, result, CACHE_TTL.SEARCH);
      return result;
    } catch (error) {
      this.logger.error(`searchShopProducts failed for shopId="${params.shopId}"`, error);
      const stale = await this.getStaleCache<any>(cacheKey);
      if (stale) {
        this.logger.warn('Returning stale cache for searchShopProducts');
        return stale;
      }
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
    headers?: Record<string, string>,
    attempt = 1,
  ): Promise<T> {
    await this.checkRateLimit();

    try {
      const defaultHeaders = {
        Accept: 'application/json',
        'User-Agent': 'YiwugoKorea/1.0',
      };

      const response = await axios.get<T>(url, {
        params,
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          ...defaultHeaders,
          ...headers,
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
        return this.request<T>(url, params, headers, attempt + 1);
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
  private getMockData(type: string): any[] {
    const mockProducts: any[] = [
      {
        productId: 'MOCK001',
        productName: '2024新款时尚女包手提包大容量单肩包',
        unitPrice: '25.00',
        minPrice: '25.00',
        maxPrice: '28.00',
        picUrl: 'https://img.yiwugo.com/mock/bag1.jpg',
        productUrl: 'https://www.yiwugo.com/product/MOCK001',
        shopId: 'SHOP001',
        shopName: '义乌箱包批发商行',
        minOrder: 2,
        stock: 5000,
        salesCount: 12500,
      },
      {
        productId: 'MOCK002',
        productName: '不锈钢保温杯便携水杯大容量500ml',
        unitPrice: '8.50',
        minPrice: '8.50',
        maxPrice: '9.50',
        picUrl: 'https://img.yiwugo.com/mock/cup1.jpg',
        productUrl: 'https://www.yiwugo.com/product/MOCK002',
        shopId: 'SHOP002',
        shopName: '义乌日用百货批发',
        minOrder: 10,
        stock: 20000,
        salesCount: 45000,
      },
    ];

    if (type === 'detail') {
      return [
        {
          ...mockProducts[0],
          description: '高品质时尚女包，大容量设计，适合日常出行。面料柔软，做工精细。厂家直销，一件代发。',
          sdiProductsPicList: [
            { url: 'https://img.yiwugo.com/mock/bag1.jpg' },
          ],
          productPropertySkuBoList: [
            { skuId: 'SKU001', properties: '颜色:黑色', price: '25.00', quantity: 2000 },
            { skuId: 'SKU002', properties: '颜色:棕色', price: '25.00', quantity: 1500 },
            { skuId: 'SKU003', properties: '颜色:红色', price: '28.00', quantity: 1500 },
          ],
        },
      ];
    }

    return mockProducts;
  }

  private getMockCategories(): any {
    return [
      { id: 'cat001', type: 'bags', entype: 'bags', typeId: 'CAT001', rank: 1 },
      { id: 'cat002', type: 'household', entype: 'household', typeId: 'CAT002', rank: 2 },
      { id: 'cat003', type: 'electronics', entype: 'electronics', typeId: 'CAT003', rank: 3 },
    ];
  }

  private getMockMarkets(): any {
    return [
      { marketCode: 'cn_yiwu', marketEnName: 'Yiwu China' },
      { marketCode: 'en_global', marketEnName: 'Global' },
    ];
  }

  private getMockShops(): any {
    return {
      total: 2,
      shops: [
        {
          shopId: 'SHOP001',
          shopName: '义乌箱包批发商行',
          shopEnglishName: 'Yiwu Bag Wholesale',
          boothNumber: '1-A-001',
          logo: 'https://img.yiwugo.com/mock/shop1.jpg',
        },
        {
          shopId: 'SHOP002',
          shopName: '义乌日用百货批发',
          shopEnglishName: 'Yiwu Household Wholesale',
          boothNumber: '2-B-015',
          logo: 'https://img.yiwugo.com/mock/shop2.jpg',
        },
      ],
    };
  }

  private getMockShopDetail(): any {
    return {
      shopId: 'SHOP001',
      shopName: '义乌箱包批发商行',
      shopEnglishName: 'Yiwu Bag Wholesale',
      boothNumber: '1-A-001',
      logo: 'https://img.yiwugo.com/mock/shop1.jpg',
      productCount: 1250,
      description: '专业从事箱包批发，产品种类齐全，质量有保障。',
      rating: 4.8,
      responseTime: '2 hours',
    };
  }
}
