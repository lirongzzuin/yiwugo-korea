import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { PopularProductsService } from './popular-products.service';
import { PopularKeywordsService } from './popular-keywords.service';
import { DataExportService } from './data-export.service';

@Module({
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    PopularProductsService,
    PopularKeywordsService,
    DataExportService,
  ],
  exports: [
    AnalyticsService,
    PopularProductsService,
    PopularKeywordsService,
    DataExportService,
  ],
})
export class AnalyticsModule {}
