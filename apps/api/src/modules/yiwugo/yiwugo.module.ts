import { Module } from '@nestjs/common';
import { YiwugoApiClient } from './yiwugo-api.client';
import { YiwugoSyncService } from './yiwugo-sync.service';
import { YiwugoImageProxyService } from './yiwugo-image-proxy.service';

@Module({
  providers: [YiwugoApiClient, YiwugoSyncService, YiwugoImageProxyService],
  exports: [YiwugoApiClient, YiwugoSyncService, YiwugoImageProxyService],
})
export class YiwugoModule {}
