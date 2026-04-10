import axios from 'axios';

// In-memory token cache (persists within serverless function warm instance)
let cachedToken: { token: string; expiresAt: number } | null = null;
// In-memory CSRF session cache
let cachedSession: { csrf: string; cookies: string; expiresAt: number } | null = null;

const API_BASE = process.env.YIWUGO_API_BASE_URL || 'https://www.yiwugo.com';
// Test credentials from Yiwugo Open Platform docs (override via env vars on production)
const CLIENT_ID = process.env.YIWUGO_CLIENT_ID || '';
const CLIENT_SECRET = process.env.YIWUGO_CLIENT_SECRET || '';

/**
 * Obtain CSRF token and session cookies from Yiwugo.
 * Yiwugo's openresty WAF requires a CSRF token for POST requests.
 * We GET the oauth/token endpoint first to receive Set-Cookie headers
 * containing the CSRF token, then include them in the actual POST.
 */
async function getCsrfSession(): Promise<{ csrf: string; cookies: string }> {
  if (cachedSession && Date.now() < cachedSession.expiresAt) {
    return { csrf: cachedSession.csrf, cookies: cachedSession.cookies };
  }

  try {
    // Step 1: GET request to obtain CSRF cookie from Yiwugo
    const preRes = await axios.get(`${API_BASE}/oauth/token`, {
      params: { grant_type: 'client_credentials', client_id: CLIENT_ID },
      headers: { Accept: 'application/json' },
      timeout: 10000,
      validateStatus: () => true, // accept any status
    });

    const setCookies: string[] = preRes.headers['set-cookie'] || [];
    const cookieStr = setCookies.map((c: string) => c.split(';')[0]).join('; ');

    // Extract CSRF token from cookies (common patterns: csrf_token, _csrf, XSRF-TOKEN, csrfToken)
    let csrfToken = '';
    for (const cookie of setCookies) {
      const match = cookie.match(/(?:csrf[_-]?token|_csrf|XSRF-TOKEN|csrfToken)\s*=\s*([^;]+)/i);
      if (match) {
        csrfToken = match[1];
        break;
      }
    }

    // Cache for 10 minutes
    cachedSession = { csrf: csrfToken, cookies: cookieStr, expiresAt: Date.now() + 600_000 };
    return { csrf: csrfToken, cookies: cookieStr };
  } catch {
    return { csrf: '', cookies: '' };
  }
}

/**
 * 1. POST /oauth/token - Get OAuth token (client_credentials grant)
 * Docs: Authorization header = Basic base64("clientId:clientSecret")
 * Query: grant_type=client_credentials&client_id=<clientId>
 *
 * Note: Yiwugo's WAF requires CSRF token, so we first obtain session cookies
 * via a GET request, then include them in the POST.
 */
async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const session = await getCsrfSession();

  const headers: Record<string, string> = {
    Authorization: `Basic ${auth}`,
    Accept: 'application/json',
  };
  // Include session cookies
  if (session.cookies) {
    headers['Cookie'] = session.cookies;
  }
  // Include CSRF token in common header locations
  if (session.csrf) {
    headers['X-CSRF-Token'] = session.csrf;
    headers['X-XSRF-TOKEN'] = session.csrf;
  }

  const response = await axios.post(`${API_BASE}/oauth/token`, null, {
    params: { grant_type: 'client_credentials', client_id: CLIENT_ID },
    headers,
    timeout: 10000,
  });

  const body = response.data;
  const token = body?.data?.accessToken;
  const expiresIn = body?.data?.expiresIn || 20000; // seconds
  if (!token) throw new Error('Failed to get Yiwugo token');

  // Cache with 60s safety margin
  cachedToken = { token, expiresAt: Date.now() + (expiresIn - 60) * 1000 };
  return token;
}

/**
 * Generic GET request with OAuth token in query params
 */
async function apiGet(path: string, params: Record<string, string> = {}): Promise<any> {
  const token = await getToken();
  const response = await axios.get(`${API_BASE}${path}`, {
    params: { ...params, access_token: token },
    timeout: 15000,
    headers: { Accept: 'application/json' },
  });
  return response.data;
}

// ─── 商铺 (Shop) APIs ───────────────────────────────────────

/**
 * 2. GET /open/cn_shop/list - Shop search
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

  const data = await apiGet('/open/cn_shop/list', query);
  return { total: data?.data?.num ?? 0, shops: data?.data?.list ?? [] };
}

/**
 * 3. GET /open/cn_shop/detail - Shop detail
 * Params: shopId (required)
 * Response: data.{ liveList, loginId, LicenseImg, showroom, picCount, productCount, ... }
 */
export async function getShopDetail(shopId: string) {
  const data = await apiGet('/open/cn_shop/detail', { shopId });
  return data?.data ?? null;
}

/**
 * 4. GET /open/cn_shop/shopCategorizeNum - Shop internal category counts
 * Params: shopId (required)
 * Response: data.data.typeProducts[] — NOTE: double nested!
 *   Each item: { defineType (category id), productNums (count) }
 */
export async function getShopCategorizeNum(shopId: string) {
  const data = await apiGet('/open/cn_shop/shopCategorizeNum', { shopId });
  // Response structure: { code, message, data: { code, data: { typeProducts }, message } }
  return data?.data?.data ?? { typeProducts: [] };
}

/**
 * 5. GET /open/cn_shop/shopSearch - Shop internal product search
 * Params: shopId, productLable, dt, st (sort), keyword, cpage, pagesize
 *   st: 1=newest, 9=sales, 4=priceAsc, 3=priceDesc
 * Response: data.{ pageSize, shopName, productdetaillist[] }
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

  const data = await apiGet('/open/cn_shop/shopSearch', query);
  return {
    shopName: data?.data?.shopName ?? '',
    pageSize: data?.data?.pageSize ?? 10,
    products: data?.data?.productdetaillist ?? [],
  };
}

// ─── 商品 (Product) APIs ────────────────────────────────────

/**
 * 6. GET /open/cn_product/list - Product search
 * Params: q (keyword), cpage, pageSize, m (market), f (floor), shopId,
 *   productLable (112=dropship, 113=print, 2=export, 4=import, 1=hot),
 *   beginNumber (MOQ), stp (min price), edp (max price),
 *   st (sort: 9=sales desc, 3=price desc, 4=price asc, 11=MOQ asc),
 *   goodLabelFlag (1=featured), onlineOrderFlag (1=online purchase)
 * Response: data.{ numfound, adShopTreoughTrainList[] }
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

  const data = await apiGet('/open/cn_product/list', query);
  return {
    total: data?.data?.numfound ?? 0,
    products: data?.data?.adShopTreoughTrainList ?? data?.data?.prslist ?? [],
  };
}

/**
 * 7. GET /open/cn_product/detail - Product detail
 * Params: productId (required)
 * Response: data.{ dealQuantitys, exchangeService, defaultFreight, loginId,
 *   smallNum (MOQ), totalprice (price in CNY), propertyList[], ... }
 */
export async function getProductDetail(productId: string) {
  const data = await apiGet('/open/cn_product/detail', { productId });
  return data?.data ?? null;
}

// ─── 常用 (Common) APIs ─────────────────────────────────────

/**
 * 8. GET /open/categorize/product - Product categories
 * Params: upperType (optional - if empty returns large categories, if set returns subcategories),
 *   webType: cn/en (required)
 * Response: data.list[] — each: { img, typeUrl, upperType, rank, typeId, id, productTypeList }
 */
export async function getCategories(upperType?: string, webType: string = 'cn') {
  const query: Record<string, string> = { webType };
  if (upperType) query.upperType = upperType;

  const data = await apiGet('/open/categorize/product', query);
  return data?.data?.list ?? [];
}

/**
 * 9. GET /open/categorize/market - Market classification list
 * Params: access_token only
 * Response: data.{ marketList[]: { marketEnName, marketCode } }
 */
export async function getMarkets() {
  const data = await apiGet('/open/categorize/market', {});
  return data?.data?.marketList ?? [];
}

/**
 * Helper: convert CNY price to KRW
 * Yiwugo product list uses sellPrice in 分 (cents), detail uses totalprice in 元 (yuan)
 */
export function convertPrice(priceCny: number, exchangeRate: number = 190, commission: number = 0.05): number {
  return Math.round(priceCny * exchangeRate * (1 + commission));
}
