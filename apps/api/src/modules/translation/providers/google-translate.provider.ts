import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const GOOGLE_TRANSLATE_API_URL =
  'https://translation.googleapis.com/language/translate/v2';

@Injectable()
export class GoogleTranslateProvider {
  private readonly logger = new Logger(GoogleTranslateProvider.name);
  private readonly apiKey: string;
  readonly name = 'google';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_TRANSLATE_API_KEY', '');
  }

  get isConfigured(): boolean {
    return !!this.apiKey;
  }

  async translate(
    text: string,
    from = 'zh-CN',
    to = 'ko',
  ): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('Google Translate provider is not configured');
    }

    try {
      const response = await axios.post(
        GOOGLE_TRANSLATE_API_URL,
        {
          q: text,
          source: this.mapLanguageCode(from),
          target: this.mapLanguageCode(to),
          format: 'text',
        },
        {
          params: { key: this.apiKey },
          headers: { 'Content-Type': 'application/json' },
          timeout: 10_000,
        },
      );

      const translations = response.data?.data?.translations;
      if (!translations || translations.length === 0) {
        throw new Error('Empty translation response from Google');
      }

      return translations[0].translatedText;
    } catch (error) {
      this.logger.error('Google Translate failed', error);
      throw error;
    }
  }

  /**
   * Map standard language codes to Google-specific codes
   */
  private mapLanguageCode(code: string): string {
    const mapping: Record<string, string> = {
      'zh-CN': 'zh-CN',
      'zh-TW': 'zh-TW',
      zh: 'zh-CN',
      ko: 'ko',
      en: 'en',
      ja: 'ja',
    };
    return mapping[code] ?? code;
  }
}
