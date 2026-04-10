import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@prisma/prisma.service';
import { YiwugoApiClient } from './yiwugo-api.client';
import { YiwugoImageProxyService } from './yiwugo-image-proxy.service';
import { mapRawToProduct } from './mappers/product.mapper';
import { mapRawToShop } from './mappers/shop.mapper';

/** How many popular products to refresh per cron run */
const POPULAR_SYNC_BATCH = 50;

@Injectable()
export class YiwugoSyncService {
  private readonly logger = new Logger(YiwugoSyncService.name);

  constructor(
    private readonly yiwugoApi: YiwugoApiClient,
    private readonly prisma: PrismaService,
    private readonly imageProxy: YiwugoImageProxyService,
  ) {}

  /**
   * Fetch a product from Yiwugo, translate, convert price, and upsert into DB
   */
  async syncProduct(numIid: string): Promise<void> {
    this.logger.log(`Syncing product ${numIid}`);

    try {
      const raw = await this.yiwugoApi.getProductDetail(numIid);

      // Fetch current exchange rate from DB or system settings
      const exchangeRate = await this.getCurrentExchangeRate();
      const commissionRate = await this.getCommissionRate();

      // Build translated product (translation placeholders — actual translation
      // is handled by the TranslationService in the calling layer or via
      // a simple passthrough for now)
      const translations = {
        title: raw.title, // Will be replaced by TranslationService
        desc: raw.desc || '',
        options: raw.props_name || '',
      };

      const product = mapRawToProduct(raw, translations, exchangeRate, commissionRate);

      // Generate proxy image URLs
      const imageUrls = raw.item_imgs?.map((img) => img.url) ?? [raw.pic_url];
      const imageProxyUrls = imageUrls.map((url) =>
        this.imageProxy.getProxiedUrl(url),
      );

      // Upsert shop if seller_id exists
      let shopDbId: string | undefined;
      if (raw.seller_id) {
        try {
          const rawShop = await this.yiwugoApi.getShopInfo(raw.seller_id);
          const shop = mapRawToShop(rawShop, {
            name: rawShop.shop_name,
            description: rawShop.description || '',
          });

          const upsertedShop = await this.prisma.shop.upsert({
            where: { sellerId: raw.seller_id },
            create: {
              sellerId: shop.id,
              nameOriginal: shop.nameOriginal,
              nameKo: shop.nameKo,
              boothNumber: shop.boothNumber,
              description: shop.description,
              descriptionKo: shop.descriptionKo,
              panoramaUrl: shop.panoramaUrl,
              logoUrl: shop.logoUrl,
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
              panoramaUrl: shop.panoramaUrl,
              logoUrl: shop.logoUrl,
              productCount: shop.productCount,
              responseRate: shop.responseRate,
              yearsInBusiness: shop.yearsInBusiness,
              isVerified: shop.isVerified,
              categories: shop.categories ?? [],
              syncedAt: new Date(),
            },
          });
          shopDbId = upsertedShop.id;
        } catch (error) {
          this.logger.warn(`Failed to sync shop for seller ${raw.seller_id}`, error);
        }
      }

      // Upsert product
      await this.prisma.product.upsert({
        where: { yiwugoId: numIid },
        create: {
          yiwugoId: numIid,
          titleOriginal: product.titleOriginal,
          titleKo: product.titleKo,
          descOriginal: product.descOriginal,
          descKo: product.descKo,
          priceOriginalCny: parseFloat(product.priceOriginalCny),
          priceKrw: parseInt(product.priceKrw, 10),
          minOrderQty: product.minOrderQty,
          stock: product.stock,
          imageUrls,
          imageProxyUrls,
          categoryId: undefined,
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
          imageUrls,
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

      // Record price history
      await this.prisma.priceHistory.create({
        data: {
          productId: (
            await this.prisma.product.findUnique({ where: { yiwugoId: numIid } })
          )!.id,
          priceCny: parseFloat(product.priceOriginalCny),
          priceKrw: parseInt(product.priceKrw, 10),
          rate: exchangeRate,
        },
      });

      this.logger.log(`Product ${numIid} synced successfully`);
    } catch (error) {
      this.logger.error(`Failed to sync product ${numIid}`, error);
      throw error;
    }
  }

  /**
   * Periodic job: refresh popular/featured products
   * Runs every 6 hours
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async syncPopularProducts(): Promise<void> {
    this.logger.log('Starting popular products sync');

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
          // Small delay between requests to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch {
          failCount++;
        }
      }

      this.logger.log(
        `Popular products sync complete: ${successCount} success, ${failCount} failed`,
      );
    } catch (error) {
      this.logger.error('syncPopularProducts cron failed', error);
    }
  }

  private async getCurrentExchangeRate(): Promise<number> {
    const rate = await this.prisma.exchangeRate.findFirst({
      where: { fromCurrency: 'CNY', toCurrency: 'KRW' },
      orderBy: { recordedAt: 'desc' },
    });
    return rate ? Number(rate.rate) : 190; // fallback default
  }

  private async getCommissionRate(): Promise<number> {
    const setting = await this.prisma.systemSetting.findUnique({
      where: { key: 'commission_rate' },
    });
    return setting ? parseFloat(setting.value) : 0.08; // default 8%
  }
}
