/** Raw shop from Shop List API (GET /open/cn_shop/list) */
export interface YiwugoShopListItem {
  shopId: number;
  userId: string;
  shopName: string;
  mainProduct: string;
  introduction: string;
  boothNo: string;
  pictureUrlSa: string; // Thumbnail
  pictureUrlA: string; // Full image
  contacter: string;
  telephone: string;
  mobile: string;
  subMarket: string;
  subFloor: string;
  subIndustry: string;
  marketDoor: string;
  marketStreet: string;
  boothModel: string;
  boothmodelAB: string;
  longitude: string;
  latitude: string;
  factoryAddress: string;
  shopImageUrl: string; // Banner image
  shopUrlId: string;
  integrityFraction: number;
  credit: number;
}

/** Raw shop from Shop Detail API (GET /open/cn_shop/detail) */
export interface YiwugoShopDetail {
  productCount: number;
  picCount: number;
  LicenseImg: string; // Business license
  shopdetail: {
    shop: {
      shopId: number;
      userId: string;
      shopName: string;
      mainProduct: string;
      introduction: string;
      boothNo: string;
      pictureUrlSa: string;
      pictureUrlA: string;
      contacter: string;
      telephone: string;
      mobile: string;
      email: string;
      weixin: string;
      qq: string;
      subMarket: string;
      subFloor: string;
      subIndustry: string;
      marketDoor: string;
      marketStreet: string;
      boothModel: string;
      boothmodelAB: string;
      longitude: string;
      latitude: string;
      factoryAddress: string;
      shopImageUrl: string;
      shopUrlId: string;
      integrityFraction: number;
      credit: number;
    };
    shopbooth: {
      submarket: string;
      subfloor: string;
      subindustry: string;
      boothno: string;
      marketInfo: string;
      newMarketInfo: string;
      latitude: string;
      longitude: string;
    };
  };
  shopLicenseImgList: string[];
  srplist: Array<{
    id: number;
    title: string;
    picture1: string;
    picture2: string;
    sellPrice: number;
    dealQuantity: number;
    shopId: number;
    shopName: string;
  }>;
  live?: {
    // Live streaming info structure
    [key: string]: unknown;
  };
}

/** Wrapper for Shop Detail API response */
export interface YiwugoShopDetailResponse {
  data: YiwugoShopDetail;
}

/** Legacy raw shop data (kept for backward compatibility) */
export interface YiwugoRawShop {
  seller_id: string;
  shop_name: string;
  booth_number?: string;
  logo_url?: string;
  panorama_url?: string;
  description?: string;
  product_count?: number;
  response_rate?: number;
  years_in_business?: number;
  is_verified?: boolean;
  categories?: string[];
  contact_phone?: string;
  contact_wechat?: string;
}

/** Normalized shop for internal use */
export interface Shop {
  id: string;
  nameOriginal: string;
  nameKo: string;
  boothNumber?: string;
  description?: string;
  descriptionKo?: string;
  panoramaUrl?: string;
  logoUrl?: string;
  productCount: number;
  responseRate?: number;
  yearsInBusiness?: number;
  isVerified: boolean;
  categories?: string[];
  syncedAt: string;
}
