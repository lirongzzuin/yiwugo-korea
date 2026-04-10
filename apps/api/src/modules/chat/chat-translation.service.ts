import { Injectable, Logger } from '@nestjs/common';
import { TranslationService } from '@modules/translation/translation.service';

@Injectable()
export class ChatTranslationService {
  private readonly logger = new Logger(ChatTranslationService.name);

  constructor(private readonly translationService: TranslationService) {}

  /**
   * Translate a chat message when the content language differs from the target language.
   * Detects source language heuristically and translates via TranslationService.
   */
  async translateMessage(
    content: string,
    targetLang: string,
    sourceLang?: string,
  ): Promise<string | null> {
    if (!content || content.trim().length === 0) {
      return null;
    }

    const detectedLang = sourceLang || this.detectLanguage(content);

    // No translation needed if same language
    if (detectedLang === targetLang) {
      return null;
    }

    try {
      const translated = await this.translationService.translate(
        content,
        detectedLang,
        targetLang,
      );
      return translated;
    } catch (error) {
      this.logger.error(
        `Failed to translate message: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Simple heuristic language detection based on character ranges.
   * For production, consider using a proper language detection library.
   */
  private detectLanguage(text: string): string {
    const sample = text.slice(0, 200);

    // Count characters by script
    let korean = 0;
    let chinese = 0;
    let latin = 0;

    for (const char of sample) {
      const code = char.codePointAt(0)!;
      if (code >= 0xac00 && code <= 0xd7a3) {
        korean++;
      } else if (
        (code >= 0x4e00 && code <= 0x9fff) ||
        (code >= 0x3400 && code <= 0x4dbf)
      ) {
        chinese++;
      } else if (code >= 0x0041 && code <= 0x024f) {
        latin++;
      }
    }

    const max = Math.max(korean, chinese, latin);
    if (max === 0) return 'zh-CN';

    if (max === korean) return 'ko';
    if (max === chinese) return 'zh-CN';
    return 'en';
  }
}
