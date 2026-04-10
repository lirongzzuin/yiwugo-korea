/** Raw product from Product List API (GET /open/cn_product/list) */
export interface YiwugoProductListItem {
  id: number;
  title: string;
  picture1: string;
  picture2: string;
  sellPrice: number; // Price in 分 (cents CNY)
  dealQuantity: number;
  shopId: number;
  shopName: string;
  shopUrlId: string;
  userId: string;
  subMarket: string;
  subFloor: string;
  boothNo: string;
  marketinfo: string;
  metric: string; // Unit like "个", "克"
  sellType: string; // 0=offline, 1=online
  priceType: string;
  onlineOrderFlag: number;
  goodLabel: boolean;
  startNum: number; // Min order qty
  sellCounts: number;
}

/** Raw product detail from Product Detail API (GET /open/cn_product/detail) */
export interface YiwugoProductDetail {
  dealQuantitys: string;
  totalprice: string; // In yuan like "9.20"
  unitprice: string; // In yuan like "0.92"
  sellType: string;
  loginId: string;
  sid: string;
  sellflag: string; // 1=active
  unitConversion: string; // Batch size multiplier
  quickRefund: number;
  orderStockInstruction: string;
  detail: {
    sdiProductsPicList: Array<{
      picture1?: string;
      picture2?: string;
      picture3?: string;
      picture?: string;
    }>;
    productPropertyDimensionOneList: Array<{
      specificationName: string;
      productId: number;
      id: number;
    }>;
    productPropertyDimensionTwoList: Array<{
      specificationName: string;
      productId: number;
      id: number;
    }>;
    productPropertySkuBoList: Array<{
      specificationNameOne: string;
      specificationNameTwo: string;
      price: number;
      stock: number;
      skuCode: string;
      picture: string;
    }>;
    productDetailVO: {
      title: string;
      sellPrice: number; // In 分 (cents)
      startNumber: number;
      freight: number;
      picture1: string;
      priceType: string;
      detaill: string; // HTML description
      metric: string;
      isRefund: number;
      goodsCode: string;
      freightTemplateId: number;
      deliveryPromise: string;
      orderStockInstruction: string; // JSON string
    };
    sdiProductsPriceList: Array<{
      startNumber: number;
      endNumber: number;
      sellPrice: number;
    }>;
    productExtendList: Array<{
      name: string;
      value: string;
    }>;
    productPackingBo: {
      shippingWeight: string;
      width: string;
      length: string;
      height: string;
      packingQuantity: number;
    };
  };
  shopinfo: {
    shop: {
      shopName: string;
      shopId: number;
      marketInfo: string;
      contacter: string;
      mobile: string;
      telephone: string;
      email: string;
      factoryAddress: string;
      pictureUrlA: string;
      shopImageUrl: string;
    };
  };
  propertyList: Array<{
    pvalue: string; // Property name like "颜色"
    cvalue: string; // Values joined
    cvalueList: string[];
  }>;
  bbsId: number;
  reportCount: number;
  canshow: boolean;
}

/** Wrapper for Product Detail API response */
export interface YiwugoProductDetailResponse {
  data: YiwugoProductDetail;
}

/** Legacy raw product data (kept for backward compatibility) */
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
