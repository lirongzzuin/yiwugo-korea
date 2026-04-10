import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@prisma/prisma.service';
import { YiwugoApiClient } from './yiwugo-api.client';
import { YiwugoImageProxyService } from './yiwugo-image-proxy.service';
import { TranslationService } from '../translation/translation.service';
import { mapProductDetail, mapProductListItem } from './mappers/product.mapper';
import { mapShopDetail, mapShopListItem } from './mappers/shop.mapper';

/** 한 번의 크론 실행에 새로고침할 인기 제품 수 */
const POPULAR_SYNC_BATCH = 50;

@Injectable()
export class YiwugoSyncService {
  private readonly logger = new Logger(YiwugoSyncService.name);

  constructor(
    private readonly yiwugoApi: YiwugoApiClient,
    private readonly prisma: PrismaService,
    private readonly imageProxy: YiwugoImageProxyService,
    private readonly translationService: TranslationService,
  ) {}

  /**
   * 제품 ID로 Yiwugo에서 상세 정보를 가져와 변환 및 DB에 업로드
   * - 제품 상세 정보 조회
   * - 환율 및 수수료 적용하여 KRW 가격 계산
   * - 상점 정보 동시 동기화
   * - 가격 이력 기록
   */
  async syncProduct(productId: string): Promise<void> {
    this.logger.log(`제품 동기화 시작: ${productId}`);

    try {
      const raw = await this.yiwugoApi.getProductDetail(productId);

      // DB 또는 시스템 설정에서 현재 환율 조회
      const exchangeRate = await this.getCurrentExchangeRate();
      const commissionRate = await this.getCommissionRate();

      // 번역 객체 생성 (실제 번역은 TranslationService에서 수행)
      const translations = {
        title: raw.detail?.productDetailVO?.title || '',
        desc: '',
        options: '',
      };

      const product = mapProductDetail(raw, translations, exchangeRate, commissionRate);

      // 이미지 프록시 URL 생성
      const imageProxyUrls = product.imageUrls.map((url) =>
        this.imageProxy.getProxiedUrl(url),
      );

      // 상점 정보 동기화 (shopId가 존재하면)
      let shopDbId: string | undefined;
      const shopinfo = raw.shopinfo || {};
      const shop = shopinfo.shop || {};

      if (shop.shopId) {
        try {
          const shopTranslations = {
            name: shop.shopName || '',
            description: shop.introduction || '',
          };

          const mappedShop = mapShopDetail(raw, shopTranslations);

          const upsertedShop = await this.prisma.shop.upsert({
            where: { sellerId: String(shop.shopId) },
            create: {
              sellerId: mappedShop.id,
              nameOriginal: mappedShop.nameOriginal,
              nameKo: mappedShop.nameKo,
              boothNumber: mappedShop.boothNumber,
              description: mappedShop.description,
              descriptionKo: mappedShop.descriptionKo,
              logoUrl: mappedShop.logoUrl,
              panoramaUrl: mappedShop.panoramaUrl,
              productCount: mappedShop.productCount,
              responseRate: mappedShop.responseRate,
              yearsInBusiness: mappedShop.yearsInBusiness,
              isVerified: mappedShop.isVerified,
              categories: mappedShop.categories ?? [],
              syncedAt: new Date(),
            },
            update: {
              nameOriginal: mappedShop.nameOriginal,
              nameKo: mappedShop.nameKo,
              boothNumber: mappedShop.boothNumber,
              description: mappedShop.description,
              descriptionKo: mappedShop.descriptionKo,
              logoUrl: mappedShop.logoUrl,
              panoramaUrl: mappedShop.panoramaUrl,
              productCount: mappedShop.productCount,
              responseRate: mappedShop.responseRate,
              yearsInBusiness: mappedShop.yearsInBusiness,
              isVerified: mappedShop.isVerified,
              categories: mappedShop.categories ?? [],
              syncedAt: new Date(),
            },
          });
          shopDbId = upsertedShop.id;
        } catch (error) {
          this.logger.warn(`상점 동기화 실패 (shopId=${shop.shopId}):`, error);
        }
      }

      // 제품 업로드
      await this.prisma.product.upsert({
        where: { yiwugoId: product.id },
        create: {
          yiwugoId: product.id,
          titleOriginal: product.titleOriginal,
          titleKo: product.titleKo,
          descOriginal: product.descOriginal,
          descKo: product.descKo,
          priceOriginalCny: parseFloat(product.priceOriginalCny),
          priceKrw: parseInt(product.priceKrw, 10),
          minOrderQty: product.minOrderQty,
          stock: product.stock,
          imageUrls: product.imageUrls,
          imageProxyUrls,
          categoryId: product.categoryId,
          shopId: shopDbId,
          detailUrl: product.detailUrl,
          options: product.options as any,
          specs: product.specs as any,
          weight: product.weight,
          viewCount: product.viewCount,
          salesCount: product.salesCount,
          isActive: true,
          syncedAt: new Date(),
        },
        update: {
          titleOriginal: product.titleOriginal,
          titleKo: product.titleKo,
          descOriginal: product.descOriginal,
          descKo: product.descKo,
          priceOriginalCny: parseFloat(product.priceOriginalCny),
          priceKrw: parseInt(product.priceKrw, 10),
          minOrderQty: product.minOrderQty,
          stock: product.stock,
          imageUrls: product.imageUrls,
          imageProxyUrls,
          shopId: shopDbId,
          detailUrl: product.detailUrl,
          options: product.options as any,
          specs: product.specs as any,
          weight: product.weight,
          viewCount: product.viewCount,
          salesCount: product.salesCount,
          syncedAt: new Date(),
        },
      });

      // 가격 이력 기록
      const upsertedProduct = await this.prisma.product.findUnique({
        where: { yiwugoId: product.id },
      });

      if (upsertedProduct) {
        await this.prisma.priceHistory.create({
          data: {
            productId: upsertedProduct.id,
            priceCny: parseFloat(product.priceOriginalCny),
            priceKrw: parseInt(product.priceKrw, 10),
            rate: exchangeRate,
          },
        });
      }

      this.logger.log(`제품 동기화 완료: ${productId}`);
    } catch (error) {
      this.logger.error(`제품 동기화 실패: ${productId}`, error);
      throw error;
    }
  }

  /**
   * 제품 배치 동기화 (검색 키워드 사용)
   * - 키워드로 제품 목록 검색
   * - 각 제품의 상세 정보 순차적으로 동기화
   * - 레이트 제한 준수하기 위해 요청 간 지연
   */
  async syncProductBatch(keyword: string, page: number = 1): Promise<void> {
    this.logger.log(`제품 배치 동기화 시작: keyword="${keyword}", page=${page}`);

    try {
      const result = await this.yiwugoApi.searchProducts({
        q: keyword,
        page,
        pageSize: 50,
      });

      const products = result.products || [];
      this.logger.log(`검색 결과: ${products.length}개 제품 발견`);

      const exchangeRate = await this.getCurrentExchangeRate();
      const commissionRate = await this.getCommissionRate();

      let successCount = 0;
      let failCount = 0;

      for (const productItem of products) {
        try {
          const translations = {
            title: productItem.title || '',
            desc: '',
            options: '',
          };

          const product = mapProductListItem(
            productItem,
            translations,
            exchangeRate,
            commissionRate,
          );

          const imageProxyUrls = product.imageUrls.map((url) =>
            this.imageProxy.getProxiedUrl(url),
          );

          await this.prisma.product.upsert({
            where: { yiwugoId: product.id },
            create: {
              yiwugoId: product.id,
              titleOriginal: product.titleOriginal,
              titleKo: product.titleKo,
              priceOriginalCny: parseFloat(product.priceOriginalCny),
              priceKrw: parseInt(product.priceKrw, 10),
              minOrderQty: product.minOrderQty,
              imageUrls: product.imageUrls,
              imageProxyUrls,
              shopId: undefined,
              isActive: true,
              syncedAt: new Date(),
              viewCount: 0,
              salesCount: product.salesCount,
              wishlistCount: 0,
              reviewCount: 0,
            },
            update: {
              titleOriginal: product.titleOriginal,
              titleKo: product.titleKo,
              priceOriginalCny: parseFloat(product.priceOriginalCny),
              priceKrw: parseInt(product.priceKrw, 10),
              minOrderQty: product.minOrderQty,
              imageUrls: product.imageUrls,
              imageProxyUrls,
              syncedAt: new Date(),
              salesCount: product.salesCount,
            },
          });

          successCount++;
          // 레이트 제한 준수: 요청 간 500ms 지연
          await this.sleep(500);
        } catch (error) {
          this.logger.warn(
            `제품 동기화 실패: ${productItem.id}`,
            error,
          );
          failCount++;
        }
      }

      this.logger.log(
        `배치 동기화 완료: ${successCount}개 성공, ${failCount}개 실패`,
      );
    } catch (error) {
      this.logger.error(
        `배치 동기화 실패: keyword="${keyword}", page=${page}`,
        error,
      );
      throw error;
    }
  }

  /**
   * 상점 정보 동기화
   * - shopId로 상점 상세 정보 조회
   * - DB에 업로드
   */
  async syncShop(shopId: string): Promise<void> {
    this.logger.log(`상점 동기화 시작: ${shopId}`);

    try {
      const raw = await this.yiwugoApi.getShopDetail(shopId);

      const translations = {
        name: raw.shop?.shopName || raw.shopName || '',
        description: raw.shop?.introduction || raw.introduction || '',
      };

      const shop = mapShopDetail(raw, translations);

      await this.prisma.shop.upsert({
        where: { sellerId: shop.id },
        create: {
          sellerId: shop.id,
          nameOriginal: shop.nameOriginal,
          nameKo: shop.nameKo,
          boothNumber: shop.boothNumber,
          description: shop.description,
          descriptionKo: shop.descriptionKo,
          logoUrl: shop.logoUrl,
          panoramaUrl: shop.panoramaUrl,
          productCount: shop.productCount,
          responseRate: shop.responseRate,
          yearsInBusiness: shop.yearsInBusiness,
          isVerified: shop.isVerified,
          categories: shop.categories ?? [],
          syncedAt: new Date(),
        },
        update: {
          nameOriginal: shop.nameOriginal,
          nameKo: shop.nameKo,
          boothNumber: shop.boothNumber,
          description: shop.description,
          descriptionKo: shop.descriptionKo,
          logoUrl: shop.logoUrl,
          panoramaUrl: shop.panoramaUrl,
          productCount: shop.productCount,
          responseRate: shop.responseRate,
          yearsInBusiness: shop.yearsInBusiness,
          isVerified: shop.isVerified,
          categories: shop.categories ?? [],
          syncedAt: new Date(),
        },
      });

      this.logger.log(`상점 동기화 완료: ${shopId}`);
    } catch (error) {
      this.logger.error(`상점 동기화 실패: ${shopId}`, error);
      throw error;
    }
  }

  /**
   * 카테고리 동기화
   * - 모든 상위 카테고리 조회
   * - 각 상위 카테고리의 하위 카테고리 조회
   * - DB에 업로드
   */
  async syncCategories(): Promise<void> {
    this.logger.log('카테고리 동기화 시작');

    try {
      // 상위 카테고리 조회
      const topCategories = await this.yiwugoApi.getCategories();

      for (const topCat of topCategories) {
        // 각 상위 카테고리의 하위 카테고리 조회
        try {
          const subCategories = await this.yiwugoApi.getCategories(topCat.id);

          const topCode = String(topCat.id);
          const topSlug = (topCat.entype || topCode).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          // 상위 카테고리 번역
          let topNameKo = topCat.type || '';
          try {
            topNameKo = await this.translationService.translate(topCat.type || '', 'ko');
          } catch { /* 번역 실패 시 원본 사용 */ }

          const parentCategory = await this.prisma.category.upsert({
            where: { code: topCode },
            create: {
              code: topCode,
              nameZh: topCat.type || '',
              nameKo: topNameKo,
              icon: topCat.img || null,
              slug: topSlug,
              sortOrder: parseInt(topCat.rank || '1000', 10),
              isActive: true,
            },
            update: {
              nameZh: topCat.type || '',
              nameKo: topNameKo,
              icon: topCat.img || null,
              sortOrder: parseInt(topCat.rank || '1000', 10),
            },
          });

          // 하위 카테고리 업로드
          for (const subCat of subCategories) {
            const subCode = String(subCat.id);
            const subSlug = (subCat.entype || subCode).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
            let subNameKo = subCat.type || '';
            try {
              subNameKo = await this.translationService.translate(subCat.type || '', 'ko');
            } catch { /* 번역 실패 시 원본 사용 */ }

            await this.prisma.category.upsert({
              where: { code: subCode },
              create: {
                code: subCode,
                nameZh: subCat.type || '',
                nameKo: subNameKo,
                parentId: parentCategory.id,
                icon: subCat.img || null,
                slug: subSlug,
                sortOrder: parseInt(subCat.rank || '1000', 10),
                isActive: true,
              },
              update: {
                nameZh: subCat.type || '',
                nameKo: subNameKo,
                icon: subCat.img || null,
                parentId: parentCategory.id,
                sortOrder: parseInt(subCat.rank || '1000', 10),
              },
            });
          }
        } catch (error) {
          this.logger.warn(
            `상위 카테고리 ${topCat.id}의 하위 카테고리 조회 실패`,
            error,
          );
        }
      }

      this.logger.log('카테고리 동기화 완료');
    } catch (error) {
      this.logger.error('카테고리 동기화 실패', error);
      throw error;
    }
  }

  /**
   * 주기적 작업: 인기 제품 새로고침
   * 6시간마다 실행
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async syncPopularProducts(): Promise<void> {
    this.logger.log('인기 제품 동기화 시작');

    try {
      const popularProducts = await this.prisma.product.findMany({
        where: { isActive: true },
        orderBy: { salesCount: 'desc' },
        take: POPULAR_SYNC_BATCH,
        select: { yiwugoId: true },
      });

      let successCount = 0;
      let failCount = 0;

      for (const product of popularProducts) {
        try {
          await this.syncProduct(product.yiwugoId);
          successCount++;
          // 레이트 제한 준수: 요청 간 500ms 지연
          await this.sleep(500);
        } catch (error) {
          this.logger.warn(`제품 ${product.yiwugoId} 동기화 실패`, error);
          failCount++;
        }
      }

      this.logger.log(
        `인기 제품 동기화 완료: ${successCount}개 성공, ${failCount}개 실패`,
      );
    } catch (error) {
      this.logger.error('인기 제품 동기화 크론 실패', error);
    }
  }

  /**
   * 주기적 작업: 카테고리 새로고침
   * 매일 자정에 실행
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncCategoriesCron(): Promise<void> {
    this.logger.log('카테고리 정기 동기화 시작');
    await this.syncCategories();
  }

  // ── Private helpers ──────────────────────────────────────

  private async getCurrentExchangeRate(): Promise<number> {
    const rate = await this.prisma.exchangeRate.findFirst({
      where: { fromCurrency: 'CNY', toCurrency: 'KRW' },
      orderBy: { recordedAt: 'desc' },
    });
    return rate ? Number(rate.rate) : 190; // 기본값: 190
  }

  private async getCommissionRate(): Promise<number> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'commission_rate' },
    });
    return setting ? parseFloat(setting.value) : 0.08; // 기본값: 8%
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
