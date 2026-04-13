import axios from 'axios';

// In-memory token cache (persists within serverless function warm instance)
let cachedToken: { token: string; expiresAt: number } | null = null;

const API_BASE = process.env.YIWUGO_API_BASE_URL || 'https://open.yiwugo.com';
// Test credentials from Yiwugo Open Platform (override via env vars on production)
const CLIENT_ID = process.env.YIWUGO_CLIENT_ID || '';
const CLIENT_SECRET = process.env.YIWUGO_CLIENT_SECRET || '';

// Browser-like User-Agent to avoid WAF blocking
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * POST /oauth/token - Get OAuth token (client_credentials grant)
 * Yiwugo Open Platform requires:
 *  - Query params: grant_type=client_credentials&client_id=<clientId>
 *  - Header: Authorization = base64("clientId:clientSecret") (NO "Basic " prefix)
 */
async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const tokenUrl = `${API_BASE}/oauth/token`;

  const response = await axios.post(tokenUrl, null, {
    params: {
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
    },
    headers: {
      Authorization: auth,
      Accept: 'application/json',
      'User-Agent': UA,
    },
    timeout: 10000,
  });

  const body = response.data;
  const token = body?.data?.accessToken;
  const expiresIn = body?.data?.expiresIn || 20000; // seconds
  if (!token) throw new Error('Failed to get Yiwugo token: ' + (body?.message || 'unknown'));

  // Cache with 60s safety margin
  cachedToken = { token, expiresAt: Date.now() + (expiresIn - 60) * 1000 };
  return token;
}

/**
 * Generic GET request with OAuth token in query params
 *
 * Next.js fetch()를 사용하여 Vercel Data Cache 활용:
 * - 같은 URL은 revalidateSeconds 동안 CDN 캐시에서 즉시 반환
 * - yiwugo API의 느린 응답(중국 서버) 문제 해결
 * - Cold start에도 캐시 유지
 *
 * 캐시 주기:
 * - 상품 검색/리스트: 5분 (트래픽 많으므로 캐시 히트율 높음)
 * - 상품 상세: 10분 (가격/재고 변동 가능성)
 * - 카테고리/마켓: 1시간 (거의 불변)
 */
async function apiGet(
  path: string,
  params: Record<string, string> = {},
  revalidateSeconds = 300,
): Promise<any> {
  const token = await getToken();

  // 쿼리스트링 수동 구성 (fetch는 params 옵션이 없음)
  const qs = new URLSearchParams({ ...params, access_token: token }).toString();
  const url = `${API_BASE}${path}?${qs}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json', 'User-Agent': UA },
      // Next.js Data Cache: 같은 URL은 revalidateSeconds 동안 캐시
      next: { revalidate: revalidateSeconds, tags: ['yiwugo'] },
    });

    if (!response.ok) {
      throw new Error(`Yiwugo API error: ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Normalize image URL: route through image proxy to bypass Yiwugo's hotlink protection.
 * Yiwugo CDN returns 403 when Referer is from external domains.
 */
export function normalizeImageUrl(url: string): string {
  if (!url) return '';
  let absoluteUrl = url;
  if (url.startsWith('//')) {
    absoluteUrl = 'https:' + url;
  } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
    absoluteUrl = 'https://img1.yiwugo.com/' + url;
  }
  // Route yiwugo domain images through proxy to bypass referrer blocking
  if (absoluteUrl.includes('yiwugo.com') || absoluteUrl.includes('alicdn.com')) {
    return '/api/img?url=' + encodeURIComponent(absoluteUrl);
  }
  return absoluteUrl;
}

// ─── 商铺 (Shop) APIs ───────────────────────────────────────

/**
 * GET /open/cn_shop/list - Shop search
 * Params: q, page, number, subMarket, subFloor, type=2 (required)
 * Response: data.num (total), data.list (shops array)
 */
export async function searchShops(params: {
  q?: string; page?: number; number?: number;
  subMarket?: string; subFloor?: string;
}) {
  const query: Record<string, string> = { type: '2' };
  if (params.q) query.q = params.q;
  if (params.page) query.page = String(params.page);
  if (params.number) query.number = String(params.number);
  if (params.subMarket) query.subMarket = params.subMarket;
  if (params.subFloor) query.subFloor = params.subFloor;

  const data = await apiGet('/open/cn_shop/list', query, 600);
  return { total: data?.data?.num ?? 0, shops: data?.data?.list ?? [] };
}

/**
 * GET /open/cn_shop/detail - Shop detail
 * 상점 상세는 10분 캐시
 */
export async function getShopDetail(shopId: string) {
  const data = await apiGet('/open/cn_shop/detail', { shopId }, 600);
  return data?.data ?? null;
}

/**
 * GET /open/cn_shop/shopCategorizeNum - Shop internal category counts
 */
export async function getShopCategorizeNum(shopId: string) {
  const data = await apiGet('/open/cn_shop/shopCategorizeNum', { shopId }, 600);
  return data?.data ?? { typeProducts: [] };
}

/**
 * GET /open/cn_shop/shopSearch - Shop internal product search
 */
export async function searchShopProducts(params: {
  shopId: string; keyword?: string; productLable?: string;
  dt?: string; st?: string; cpage?: number; pagesize?: number;
}) {
  const query: Record<string, string> = { shopId: params.shopId };
  if (params.keyword) query.keyword = params.keyword;
  if (params.productLable) query.productLable = params.productLable;
  if (params.dt) query.dt = params.dt;
  if (params.st) query.st = params.st;
  if (params.cpage) query.cpage = String(params.cpage);
  if (params.pagesize) query.pagesize = String(params.pagesize);

  const data = await apiGet('/open/cn_shop/shopSearch', query, 300);
  return {
    shopName: data?.data?.shopName ?? '',
    pageSize: data?.data?.pageSize ?? 10,
    totalCount: data?.data?.totalCount ?? 0,
    products: data?.data?.productdetaillist ?? [],
  };
}

// ─── 商品 (Product) APIs ────────────────────────────────────

/**
 * GET /open/cn_product/list - Product search
 * Params: q (keyword), cpage, pageSize, m (market), f (floor), shopId,
 *   productLable (112=dropship, 113=freeShipping, 2=export, 4=import, 1=hot),
 *   beginNumber (MOQ), stp (min price in 分), edp (max price in 分),
 *   st (sort: 9=sales desc, 3=price desc, 4=price asc),
 *   goodLabelFlag (1=featured), onlineOrderFlag (1=online purchase)
 * Response: data.{ numfound, prslist[], adShopTreoughTrainList[], subMarketList[], categoryList[] }
 */
export async function searchProducts(params: {
  q?: string; cpage?: number; pageSize?: number;
  m?: string; f?: string; shopId?: string;
  productLable?: string; beginNumber?: number;
  stp?: number; edp?: number; st?: number;
  goodLabelFlag?: string; onlineOrderFlag?: string;
}) {
  const query: Record<string, string> = {};
  if (params.q) query.q = params.q;
  if (params.cpage) query.cpage = String(params.cpage);
  if (params.pageSize) query.pageSize = String(params.pageSize);
  if (params.m) query.m = params.m;
  if (params.f) query.f = params.f;
  if (params.shopId) query.shopId = params.shopId;
  if (params.productLable) query.productLable = params.productLable;
  if (params.beginNumber) query.beginNumber = String(params.beginNumber);
  if (params.stp !== undefined) query.stp = String(params.stp);
  if (params.edp !== undefined) query.edp = String(params.edp);
  if (params.st) query.st = String(params.st);
  if (params.goodLabelFlag) query.goodLabelFlag = params.goodLabelFlag;
  if (params.onlineOrderFlag) query.onlineOrderFlag = params.onlineOrderFlag;

  // 상품 검색 결과는 5분 캐시 (자주 변함)
  const data = await apiGet('/open/cn_product/list', query, 300);
  return {
    total: data?.data?.numfound ?? 0,
    products: data?.data?.prslist ?? [],
    adShops: data?.data?.adShopTreoughTrainList ?? [],
    subMarketList: data?.data?.subMarketList ?? [],
    categoryList: data?.data?.categoryList ?? [],
  };
}

/**
 * GET /open/cn_product/detail - Product detail
 * Params: productId (required)
 * 상품 상세는 10분 캐시 (가격/재고 변동 반영)
 */
export async function getProductDetail(productId: string) {
  const data = await apiGet('/open/cn_product/detail', { productId: productId }, 600);
  return data?.data ?? null;
}

// ─── 常用 (Common) APIs ─────────────────────────────────────

/**
 * GET /open/categorize/product - Product categories
 * 카테고리는 1시간 캐시 (거의 불변)
 */
export async function getCategories(upperType?: string, webType: string = 'cn') {
  const query: Record<string, string> = { webType };
  if (upperType) query.upperType = upperType;

  const data = await apiGet('/open/categorize/product', query, 3600);
  return data?.data?.list ?? [];
}

/**
 * GET /open/categorize/market - Market classification list
 * 마켓 정보는 1시간 캐시
 */
export async function getMarkets() {
  const data = await apiGet('/open/categorize/market', {}, 3600);
  return data?.data?.marketList ?? [];
}

/**
 * Helper: convert CNY price to KRW
 * Yiwugo product list uses sellPrice in 分 (cents), detail uses totalprice in 元 (yuan)
 */
export function convertPrice(priceCny: number, exchangeRate: number = 190, commission: number = 0.05): number {
  return Math.round(priceCny * exchangeRate * (1 + commission));
}
