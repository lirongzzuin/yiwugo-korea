/** Raw product data from Yiwugo API */
export interface YiwugoRawProduct {
  num_iid: string;
  title: string;
  price: string;
  pic_url: string;
  detail_url: string;
  props_name: string;
  seller_id: string;
  seller_nick?: string;
  shop_name?: string;
  booth_number?: string;
  category_id?: string;
  sub_category_id?: string;
  min_order_qty?: number;
  stock?: number;
  weight?: string;
  desc?: string;
  item_imgs?: Array<{ url: string }>;
  prop_imgs?: Array<{ properties: string; url: string }>;
  sku_list?: Array<{
    sku_id: string;
    properties_name: string;
    price: string;
    quantity: number;
  }>;
  sales_count?: number;
  view_count?: number;
}

/** Normalized product for internal use */
export interface Product {
  id: string;
  titleOriginal: string;
  titleKo: string;
  titleKoManual?: string;
  descOriginal?: string;
  descKo?: string;
  priceOriginalCny: string;
  priceKrw: string;
  originalPriceKrw?: string;
  minOrderQty: number;
  stock?: number;
  imageUrls: string[];
  imageProxyUrls?: string[];
  categoryId?: string;
  subCategoryId?: string;
  shopId?: string;
  shopName?: string;
  shopNameKo?: string;
  detailUrl?: string;
  options?: ProductOption[];
  optionsKo?: ProductOption[];
  specs?: Record<string, string>;
  specsKo?: Record<string, string>;
  weight?: string;
  viewCount: number;
  salesCount: number;
  wishlistCount: number;
  reviewCount: number;
  averageRating?: number;
  isActive: boolean;
  isFeatured: boolean;
  syncedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductOption {
  name: string;
  nameKo?: string;
  values: ProductOptionValue[];
}

export interface ProductOptionValue {
  value: string;
  valueKo?: string;
  imageUrl?: string;
  priceAdj?: string;
}

export interface ProductSearchParams {
  q?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'sales' | 'newest' | 'rating';
  minPrice?: number;
  maxPrice?: number;
  shopId?: string;
}

export interface ProductSearchResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}
