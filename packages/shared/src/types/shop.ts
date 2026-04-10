/** Raw shop data from Yiwugo API */
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
