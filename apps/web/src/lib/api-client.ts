import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { getAccessToken, setAccessToken, clearTokens } from './auth';
import {
  MOCK_EXCHANGE_RATE,
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_ORDERS,
  MOCK_USER,
  MOCK_NOTIFICATIONS,
  MOCK_REVIEWS,
  MOCK_BANNERS,
  MOCK_SHOPS,
  MOCK_NOTICES,
  generateMockProduct,
} from './mock-data';

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Demo mode: when NEXT_PUBLIC_API_URL is empty, all API calls
 * are intercepted and return mock data.
 */
const IS_DEMO_MODE = !process.env.NEXT_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Mock response helper ---
function mockResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
}

/**
 * Mock route matcher: returns mock data for known API paths.
 * Returns null if no mock is available (falls through to real API).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMockData(url: string, _method: string): any {
  // Normalize URL
  const path = url.replace(/^\/api(\/v1)?/, '').replace(/\?.*$/, '');

  // Exchange rate
  if (path === '/exchange-rate' || path.startsWith('/exchange-rate')) {
    return MOCK_EXCHANGE_RATE;
  }

  // Categories
  if (path === '/categories') {
    return { data: MOCK_CATEGORIES, total: MOCK_CATEGORIES.length };
  }

  // Products / search
  if (path === '/products' || path === '/products/search') {
    const products = Array.from({ length: 24 }, (_, i) => generateMockProduct(i));
    return { data: products, total: products.length, page: 1, pageSize: 24 };
  }
  if (path === '/products/featured') {
    const products = Array.from({ length: 8 }, (_, i) => generateMockProduct(i));
    return { data: products, total: products.length };
  }
  if (path === '/products/popular') {
    const products = Array.from({ length: 12 }, (_, i) => generateMockProduct(i + 100));
    return { data: products, total: products.length };
  }
  const productMatch = path.match(/^\/products\/([\w-]+)$/);
  if (productMatch) {
    const id = productMatch[1];
    const idx = parseInt(id.replace('prod-', ''), 10) || 0;
    const product = generateMockProduct(idx);
    return {
      ...product,
      description: '고품질 중국 이우 시장 직소싱 상품입니다. 품질 검수 완료.',
      specifications: { 소재: 'ABS + 실리콘', 무게: '250g', 사이즈: '15x10x8cm' },
      shop: MOCK_SHOPS[idx % MOCK_SHOPS.length],
      images: Array.from({ length: 4 }, (_, i) => `https://picsum.photos/seed/yiwu${idx}_${i}/800/800`),
    };
  }

  // Orders
  if (path === '/orders') {
    return { data: MOCK_ORDERS, total: MOCK_ORDERS.length };
  }
  const orderMatch = path.match(/^\/orders\/([\w-]+)$/);
  if (orderMatch) {
    const order = MOCK_ORDERS.find((o) => o.id === orderMatch[1]) || MOCK_ORDERS[0];
    return order;
  }

  // User / profile
  if (path === '/auth/me' || path === '/users/me' || path === '/profile') {
    return MOCK_USER;
  }

  // Auth (demo: always succeed)
  if (path === '/auth/login') {
    return { accessToken: 'demo-token', user: MOCK_USER };
  }
  if (path === '/auth/register') {
    return { accessToken: 'demo-token', user: MOCK_USER };
  }
  if (path === '/auth/refresh') {
    return { accessToken: 'demo-token' };
  }

  // Notifications
  if (path === '/notifications') {
    return { data: MOCK_NOTIFICATIONS, total: MOCK_NOTIFICATIONS.length, unreadCount: 2 };
  }

  // Reviews
  if (path === '/reviews') {
    return { data: MOCK_REVIEWS, total: MOCK_REVIEWS.length };
  }

  // Banners
  if (path === '/banners') {
    return { data: MOCK_BANNERS };
  }

  // Shops
  if (path === '/shops') {
    return { data: MOCK_SHOPS, total: MOCK_SHOPS.length };
  }
  const shopMatch = path.match(/^\/shops\/([\w-]+)$/);
  if (shopMatch) {
    const shop = MOCK_SHOPS.find((s) => s.id === shopMatch[1]) || MOCK_SHOPS[0];
    return {
      ...shop,
      products: Array.from({ length: 12 }, (_, i) => generateMockProduct(i + 300)),
    };
  }

  // Cart (empty by default in demo)
  if (path === '/cart') {
    return { items: [], totalKRW: 0, totalCNY: 0 };
  }

  // Wishlist
  if (path === '/wishlist') {
    return { data: MOCK_PRODUCTS.slice(0, 4) };
  }

  // Notices
  if (path === '/notices') {
    return { data: MOCK_NOTICES, total: MOCK_NOTICES.length };
  }
  const noticeMatch = path.match(/^\/notices\/([\w-]+)$/);
  if (noticeMatch) {
    const notice = MOCK_NOTICES.find((n) => n.id === noticeMatch[1]) || MOCK_NOTICES[0];
    return notice;
  }

  // Coupons
  if (path === '/coupons') {
    return { data: [], total: 0 };
  }

  // Settings
  if (path === '/settings') {
    return { commissionRate: 8, exchangeMargin: 1.5, pointsEarnRate: 1 };
  }

  // Admin sync endpoints
  if (path.startsWith('/admin/sync')) {
    return { success: true, message: 'Sync completed in demo mode' };
  }

  // Admin stats
  if (path.startsWith('/admin')) {
    return {
      totalUsers: 1247,
      totalOrders: 3891,
      totalRevenue: 458200000,
      monthlyGrowth: 12.5,
    };
  }

  // Default: return null (no mock available)
  return null;
}

// --- Demo mode interceptor ---
if (IS_DEMO_MODE) {
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const url = config.url || '';
      const method = (config.method || 'get').toUpperCase();
      const mock = getMockData(url, method);

      if (mock !== null) {
        // Abort the real request and return mock data via adapter
        const response = mockResponse(mock);
        response.config = config;
        // Use the adapter trick: throw a "cancel" with the response
        return Promise.reject({
          __MOCK__: true,
          response,
        }) as never;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // Intercept our mock "errors" and return them as successful responses
      if (error?.__MOCK__) {
        return Promise.resolve(error.response);
      }
      return Promise.reject(error);
    }
  );
} else {
  // --- Production mode: real API interceptors ---

  // Request interceptor: attach access token
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: handle 401 + token refresh
  let isRefreshing = false;
  let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
    config: AxiosRequestConfig;
  }> = [];

  const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else {
        if (config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        resolve(apiClient(config));
      }
    });
    failedQueue = [];
  };

  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
      const originalRequest = error.config;

      if (!originalRequest || error.response?.status !== 401) {
        return Promise.reject(extractApiError(error));
      }

      // Avoid infinite loop on refresh endpoint
      if (originalRequest.url?.includes('/auth/refresh')) {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(extractApiError(error));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = data.accessToken;
        setAccessToken(newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        processQueue(null, newToken);

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(extractApiError(error));
      } finally {
        isRefreshing = false;
      }
    }
  );
}

function extractApiError(error: AxiosError<ApiError>): ApiError {
  if (error.response?.data) {
    return {
      status: error.response.status,
      code: error.response.data.code || 'UNKNOWN_ERROR',
      message: error.response.data.message || '알 수 없는 오류가 발생했습니다.',
      details: error.response.data.details,
    };
  }

  if (error.code === 'ECONNABORTED') {
    return {
      status: 408,
      code: 'TIMEOUT',
      message: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
    };
  }

  return {
    status: 0,
    code: 'NETWORK_ERROR',
    message: '네트워크 연결을 확인해주세요.',
  };
}

/**
 * High-level API interface for the application
 * Provides typed methods that map to backend endpoints
 */
export const api = {
  // Product endpoints
  products: {
    /**
     * Search products with filters
     * GET /products/search?q=&page=&pageSize=&sortBy=&minPrice=&maxPrice=&categoryId=&shopId=
     */
    async search(params: {
      q?: string;
      page?: number;
      pageSize?: number;
      sortBy?: string;
      minPrice?: number;
      maxPrice?: number;
      categoryId?: string;
      shopId?: string;
    }) {
      const response = await apiClient.get('/products/search', { params });
      return response.data;
    },

    /**
     * Get featured products
     * GET /products/featured
     */
    async getFeatured() {
      const response = await apiClient.get('/products/featured');
      return response.data;
    },

    /**
     * Get popular products
     * GET /products/popular?limit=
     */
    async getPopular(limit = 12) {
      const response = await apiClient.get('/products/popular', { params: { limit } });
      return response.data;
    },

    /**
     * Get product detail
     * GET /products/:id
     */
    async getDetail(id: string) {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    },
  },

  // Category endpoints
  categories: {
    /**
     * Get all categories tree
     * GET /categories
     */
    async getAll() {
      const response = await apiClient.get('/categories');
      return response.data;
    },

    /**
     * Get category detail by slug
     * GET /categories/:slug
     */
    async getBySlug(slug: string) {
      const response = await apiClient.get(`/categories/${slug}`);
      return response.data;
    },
  },

  // Exchange rate endpoints
  exchangeRate: {
    /**
     * Get current exchange rate
     * GET /exchange-rate/current
     */
    async getCurrent() {
      const response = await apiClient.get('/exchange-rate/current');
      return response.data;
    },

    /**
     * Get exchange rate history
     * GET /exchange-rate/history?days=
     */
    async getHistory(days = 30) {
      const response = await apiClient.get('/exchange-rate/history', { params: { days } });
      return response.data;
    },
  },

  // Admin sync endpoints (requires authentication + ADMIN role)
  sync: {
    /**
     * Sync categories from Yiwugo
     * POST /admin/sync/categories
     */
    async syncCategories() {
      const response = await apiClient.post('/admin/sync/categories');
      return response.data;
    },

    /**
     * Sync products from Yiwugo by keyword
     * POST /admin/sync/products
     */
    async syncProducts(keyword: string, page = 1) {
      const response = await apiClient.post('/admin/sync/products', {
        keyword,
        page,
      });
      return response.data;
    },

    /**
     * Sync specific product
     * POST /admin/sync/products/:productId
     */
    async syncProduct(productId: string) {
      const response = await apiClient.post(`/admin/sync/products/${productId}`);
      return response.data;
    },

    /**
     * Sync specific shop
     * POST /admin/sync/shops/:shopId
     */
    async syncShop(shopId: string) {
      const response = await apiClient.post(`/admin/sync/shops/${shopId}`);
      return response.data;
    },
  },
};

export default apiClient;
