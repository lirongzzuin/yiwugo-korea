/** Raw category from Category API (GET /open/categorize/product) */
export interface YiwugoCategoryItem {
  id: number;
  type: string; // Chinese category name
  entype: string; // English category name
  img: string; // Icon URL
  typeUrl: string;
  uppertype: string;
  rank: string;
  typeId: string;
}

/** Category list response wrapper */
export interface YiwugoCategoryListResponse {
  data: {
    list: YiwugoCategoryItem[];
  };
}

/** Raw market from Market List API (GET /open/categorize/market) */
export interface YiwugoMarketItem {
  marketEnName: string; // English market name
  marketCode: string;
}

/** Market list response wrapper */
export interface YiwugoMarketListResponse {
  data: {
    marketList: YiwugoMarketItem[];
  };
}

/** Normalized category for internal use */
export interface Category {
  id: string;
  nameOriginal: string;
  nameKo?: string;
  nameEn: string;
  iconUrl?: string;
  parentId?: string;
  urlPath?: string;
  rank?: number;
}

/** Normalized market for internal use */
export interface Market {
  code: string;
  nameEn: string;
  nameOriginal?: string;
  nameKo?: string;
}
