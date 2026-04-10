import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

const PAPAGO_API_URL = 'https://openapi.naver.com/v1/papago/n2mt';

@Injectable()
export class PapagoProvider {
  private readonly logger = new Logger(PapagoProvider.name);
  private readonly clientId: string;
  private readonly clientSecret: string;
  readonly name = 'papago';

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('NAVER_CLIENT_ID', '');
    this.clientSecret = this.configService.get<string>('NAVER_CLIENT_SECRET', '');
  }

  get isConfigured(): boolean {
    return !!this.clientId && !!this.clientSecret;
  }

  async translate(
    text: string,
    from = 'zh-CN',
    to = 'ko',
  ): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('Papago provider is not configured');
    }

    try {
      const response = await axios.post(
        PAPAGO_API_URL,
        new URLSearchParams({
          source: this.mapLanguageCode(from),
          target: this.mapLanguageCode(to),
          text,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Naver-Client-Id': this.clientId,
            'X-Naver-Client-Secret': this.clientSecret,
          },
          timeout: 10_000,
        },
      );

      const translatedText =
        response.data?.message?.result?.translatedText;

      if (!translatedText) {
        throw new Error('Empty translation response from Papago');
      }

      return translatedText;
    } catch (error) {
      this.logger.error('Papago translation failed', error);
      throw error;
    }
  }

  /**
   * Map standard language codes to Papago-specific codes
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
