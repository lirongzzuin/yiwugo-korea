import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { KakaoAlimTalkProvider } from './providers/kakao-alimtalk.provider';
import { EmailProvider } from './providers/email.provider';
import { PushProvider } from './providers/push.provider';

@Module({
  controllers: [NotificationController],
  providers: [
    NotificationService,
    KakaoAlimTalkProvider,
    EmailProvider,
    PushProvider,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
