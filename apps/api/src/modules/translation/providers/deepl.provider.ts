import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class DeepLProvider {
  private readonly logger = new Logger(DeepLProvider.name);
  private readonly apiKey: string;
  private readonly apiUrl: string;
  readonly name = 'deepl';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('DEEPL_API_KEY', '');
    // Free plan uses api-free.deepl.com, Pro uses api.deepl.com
    const isPro = this.configService.get<string>('DEEPL_PRO', 'false') === 'true';
    this.apiUrl = isPro
      ? 'https://api.deepl.com/v2/translate'
      : 'https://api-free.deepl.com/v2/translate';
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
      throw new Error('DeepL provider is not configured');
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        new URLSearchParams({
          auth_key: this.apiKey,
          text,
          source_lang: this.mapLanguageCode(from),
          target_lang: this.mapLanguageCode(to),
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 15_000,
        },
      );

      const translations = response.data?.translations;
      if (!translations || translations.length === 0) {
        throw new Error('Empty translation response from DeepL');
      }

      return translations[0].text;
    } catch (error) {
      this.logger.error('DeepL translation failed', error);
      throw error;
    }
  }

  /**
   * Map standard language codes to DeepL-specific codes
   */
  private mapLanguageCode(code: string): string {
    const mapping: Record<string, string> = {
      'zh-CN': 'ZH',
      'zh-TW': 'ZH',
      zh: 'ZH',
      ko: 'KO',
      en: 'EN',
      ja: 'JA',
      de: 'DE',
      fr: 'FR',
    };
    return mapping[code] ?? code.toUpperCase();
  }
}
