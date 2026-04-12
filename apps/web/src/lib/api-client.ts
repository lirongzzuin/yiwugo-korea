import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { getAccessToken, setAccessToken, clearTokens } from './auth';

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * API client
 *
 * baseURL: NEXT_PUBLIC_API_URL이 설정되면 외부 백엔드로,
 *          아니면 Next.js 내부 API routes(/api/*)를 사용.
 *
 * 인터셉터:
 *  - 요청: accessToken을 Authorization 헤더에 자동 첨부
 *  - 응답: 401 시 /auth/refresh로 토큰 갱신 후 원 요청 재시도
 */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request interceptor: attach access token ---
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

// --- Response interceptor: handle 401 + token refresh ---
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

    // refresh 엔드포인트에서 401이면 로그인 페이지로
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
 */
export const api = {
  products: {
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

    async getFeatured() {
      const response = await apiClient.get('/products/featured');
      return response.data;
    },

    async getPopular(limit = 12) {
      const response = await apiClient.get('/products/popular', { params: { limit } });
      return response.data;
    },

    async getDetail(id: string) {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    },
  },

  shops: {
    async search(params: {
      q?: string;
      page?: number;
      number?: number;
      subMarket?: string;
      subFloor?: string;
    }) {
      const response = await apiClient.get('/shops/search', { params });
      return response.data;
    },

    async getDetail(shopId: string) {
      const response = await apiClient.get(`/shops/${shopId}`);
      return response.data;
    },

    async getCategories(shopId: string) {
      const response = await apiClient.get(`/shops/${shopId}/categories`);
      return response.data;
    },

    async searchProducts(shopId: string, params: {
      keyword?: string;
      productLable?: string;
      st?: string;
      page?: number;
      pageSize?: number;
    }) {
      const response = await apiClient.get(`/shops/${shopId}/products`, { params });
      return response.data;
    },
  },

  categories: {
    async getAll() {
      const response = await apiClient.get('/categories');
      return response.data;
    },

    async getBySlug(slug: string) {
      const response = await apiClient.get(`/categories/${slug}`);
      return response.data;
    },
  },

  exchangeRate: {
    async getCurrent() {
      const response = await apiClient.get('/exchange-rate/current');
      return response.data;
    },

    async getHistory(days = 30) {
      const response = await apiClient.get('/exchange-rate/history', { params: { days } });
      return response.data;
    },
  },

  sync: {
    async syncCategories() {
      const response = await apiClient.post('/admin/sync/categories');
      return response.data;
    },

    async syncProducts(keyword: string, page = 1) {
      const response = await apiClient.post('/admin/sync/products', { keyword, page });
      return response.data;
    },

    async syncProduct(productId: string) {
      const response = await apiClient.post(`/admin/sync/products/${productId}`);
      return response.data;
    },

    async syncShop(shopId: string) {
      const response = await apiClient.post(`/admin/sync/shops/${shopId}`);
      return response.data;
    },
  },
};

export default apiClient;
