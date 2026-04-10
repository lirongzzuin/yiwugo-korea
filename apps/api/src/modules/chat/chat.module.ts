import { Module } from '@nestjs/common';
import { TranslationModule } from '@modules/translation/translation.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatTranslationService } from './chat-translation.service';

@Module({
  imports: [TranslationModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, ChatTranslationService],
  exports: [ChatService],
})
export class ChatModule {}
