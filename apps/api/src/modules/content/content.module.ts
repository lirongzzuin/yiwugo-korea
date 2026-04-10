import { Module } from '@nestjs/common';
import { BannerService } from './banner.service';
import { BannerController } from './banner.controller';
import { NoticeService } from './notice.service';
import { NoticeController } from './notice.controller';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { PageService } from './page.service';
import { PageController } from './page.controller';

@Module({
  controllers: [
    BannerController,
    NoticeController,
    FaqController,
    PageController,
  ],
  providers: [BannerService, NoticeService, FaqService, PageService],
  exports: [BannerService, NoticeService, FaqService, PageService],
})
export class ContentModule {}
