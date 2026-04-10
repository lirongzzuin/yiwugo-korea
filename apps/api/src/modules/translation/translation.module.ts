import { Module } from '@nestjs/common';
import { TranslationService } from './translation.service';
import { TranslationCacheService } from './translation-cache.service';
import { PapagoProvider } from './providers/papago.provider';
import { DeepLProvider } from './providers/deepl.provider';
import { GoogleTranslateProvider } from './providers/google-translate.provider';

@Module({
  providers: [
    TranslationService,
    TranslationCacheService,
    PapagoProvider,
    DeepLProvider,
    GoogleTranslateProvider,
  ],
  exports: [TranslationService, TranslationCacheService],
})
export class TranslationModule {}
