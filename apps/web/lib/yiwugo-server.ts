import axios from 'axios';

// In-memory token cache
let cachedToken: { token: string; expiresAt: number } | null = null;

const API_BASE = process.env.YIWUGO_API_BASE_URL || 'https://www.yiwugo.com';
const CLIENT_ID = process.env.YIWUGO_CLIENT_ID || '';
const CLIENT_SECRET = process.env.YIWUGO_CLIENT_SECRET || '';

/**
 * 1. POST /oauth/token - Get OAuth token
 */
async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  const response = await axios.post(`${API_BASE}/oauth/token`, null, {
    params: { grant_type: 'client_credentials', client_id: CLIENT_ID },
    headers: { Authorization: `Basic ${auth}` },
    timeout: 10000,
  });

  const token = response.data?.data?.accessToken;
  const expiresIn = response.data?.data?.expiresIn || 20000;
  if (!token) throw new Error('Failed to get Yiwugo token');

  cachedToken = { token, expiresAt: Date.now() + (expiresIn - 60) * 1000 };
  return token;
}

async function apiGet(path: string, params: Record<string, string> = {}): Promise<any> {
  const token = await getToken();
  const response = await axios.get(`${API_BASE}${path}`, {
    params: { ...params, access_token: token },
    timeout: 15000,
    headers: { Accept: 'application/json' },
  });
  return response.data;
}

/**
 * 2. GET /open/cn_shop/list - Shop search
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
 */
export async function getShopDetail(shopId: string) {
  const data = await apiGet('/open/cn_shop/detail', { shopId });
  return data?.data ?? null;
}

/**
 * 4. GET /open/cn_shop/shopCategorizeNum - Shop internal category counts
 */
export async function getShopCategorizeNum(shopId: string) {
  const data = await apiGet('/open/cn_shop/shopCategorizeNum', { shopId });
  return data?.data ?? { typeProducts: [] };
}

/**
 * 5. GET /open/cn_shop/shopSearch - Shop internal product search
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

/**
 * 6. GET /open/cn_product/list - Product search
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
 */
export async function getProductDetail(productId: string) {
  const data = await apiGet('/open/cn_product/detail', { productId });
  return data?.data ?? null;
}

/**
 * 8. GET /open/categorize/product - Product categories
 */
export async function getCategories(upperType?: string, webType: string = 'cn') {
  const query: Record<string, string> = { webType };
  if (upperType) query.upperType = upperType;

  const data = await apiGet('/open/categorize/product', query);
  return data?.data?.list ?? [];
}

/**
 * 9. GET /open/categorize/market - Market list
 */
export async function getMarkets() {
  const data = await apiGet('/open/categorize/market', {});
  return data?.data?.marketList ?? [];
}

/**
 * Helper: convert CNY price (in 分) to KRW
 */
export function convertPrice(sellPriceFen: number, exchangeRate: number = 180, commission: number = 0.05): number {
  const cny = sellPriceFen / 100;
  return Math.round(cny * exchangeRate * (1 + commission));
}
