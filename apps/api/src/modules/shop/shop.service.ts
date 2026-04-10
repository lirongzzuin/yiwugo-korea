import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { YiwugoApiClient } from '@modules/yiwugo/yiwugo-api.client';
import { TranslationService } from '@modules/translation/translation.service';
import { ExchangeRateService } from '@modules/exchange-rate/exchange-rate.service';
import { mapShopListItem, mapShopDetail } from '@modules/yiwugo/mappers/shop.mapper';
import { mapProductListItem } from '@modules/yiwugo/mappers/product.mapper';

@Injectable()
export class ShopService {
  private readonly logger = new Logger(ShopService.name);

  constructor(
    private readonly yiwugoApi: YiwugoApiClient,
    private readonly translationService: TranslationService,
    private readonly exchangeRateService: ExchangeRateService,
  ) {}

  /**
   * 상점 검색
   */
  async searchShops(params: {
    q?: string;
    page?: number;
    number?: number;
    subMarket?: string;
    subFloor?: string;
  }) {
    const result = await this.yiwugoApi.searchShops(params);
    const shops = [];

    for (const raw of result.shops) {
      let nameKo = raw.shopName || '';
      try {
        nameKo = await this.translationService.translate(raw.shopName || '', 'ko');
      } catch { /* 번역 실패 시 원본 사용 */ }

      shops.push(mapShopListItem(raw, {
        name: nameKo,
        description: '',
      }));
    }

    return {
      total: result.total,
      shops,
    };
  }

  /**
   * 상점 상세 조회
   */
  async getShopDetail(shopId: string) {
    const raw = await this.yiwugoApi.getShopDetail(shopId);
    if (!raw) throw new NotFoundException(`상점을 찾을 수 없습니다: ${shopId}`);

    let nameKo = raw.shopName || raw.shopname || '';
    let descKo = '';
    try {
      nameKo = await this.translationService.translate(nameKo, 'ko');
      const desc = raw.introduction || raw.description || '';
      if (desc) {
        descKo = await this.translationService.translate(desc, 'ko');
      }
    } catch { /* 번역 실패 시 원본 사용 */ }

    return mapShopDetail(raw, {
      name: nameKo,
      description: descKo,
    });
  }

  /**
   * 상점 내부 카테고리별 상품 수량 조회
   * GET /open/cn_shop/shopCategorizeNum
   */
  async getShopCategories(shopId: string) {
    const data = await this.yiwugoApi.getShopCategorizeNum(shopId);
    return {
      shopId,
      categories: (data?.typeProducts || []).map((item: any) => ({
        categoryId: String(item.defineType),
        productCount: item.productNums || 0,
      })),
    };
  }

  /**
   * 상점 내부 상품 검색
   * GET /open/cn_shop/shopSearch
   */
  async searchShopProducts(params: {
    shopId: string;
    keyword?: string;
    productLable?: string;
    dt?: string;
    st?: string;
    page?: number;
    pageSize?: number;
  }) {
    const result = await this.yiwugoApi.searchShopProducts({
      shopId: params.shopId,
      keyword: params.keyword,
      productLable: params.productLable,
      dt: params.dt,
      st: params.st,
      cpage: params.page,
      pagesize: params.pageSize,
    });

    // 환율 조회 및 상품 변환
    const rate = await this.exchangeRateService.getCurrentRate();
    const exchangeRate = rate?.rate || 180;
    const commissionRate = 0.05;

    const products = [];
    for (const raw of (result.products || [])) {
      let titleKo = raw.title || raw.productName || '';
      try {
        titleKo = await this.translationService.translate(titleKo, 'ko');
      } catch { /* 번역 실패 시 원본 사용 */ }

      products.push(mapProductListItem(raw, { title: titleKo, desc: '', options: '' }, exchangeRate, commissionRate));
    }

    return {
      shopName: result.shopName,
      pageSize: result.pageSize,
      products,
    };
  }
}
