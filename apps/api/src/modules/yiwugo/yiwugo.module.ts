import { Module, forwardRef } from '@nestjs/common';
import { YiwugoApiClient } from './yiwugo-api.client';
import { YiwugoSyncService } from './yiwugo-sync.service';
import { YiwugoImageProxyService } from './yiwugo-image-proxy.service';
import { YiwugoSyncController } from './yiwugo-sync.controller';
import { CategoryModule } from '@modules/category/category.module';
import { TranslationModule } from '@modules/translation/translation.module';

@Module({
  imports: [forwardRef(() => CategoryModule), TranslationModule],
  controllers: [YiwugoSyncController],
  providers: [YiwugoApiClient, YiwugoSyncService, YiwugoImageProxyService],
  exports: [YiwugoApiClient, YiwugoSyncService, YiwugoImageProxyService],
})
export class YiwugoModule {}
