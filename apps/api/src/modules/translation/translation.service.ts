import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TranslationCacheService } from './translation-cache.service';
import { PapagoProvider } from './providers/papago.provider';
import { DeepLProvider } from './providers/deepl.provider';
import { GoogleTranslateProvider } from './providers/google-translate.provider';
import * as glossaryData from './glossary/product-glossary.json';

type TranslationProvider = PapagoProvider | DeepLProvider | GoogleTranslateProvider;

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly providerPriority: string[];
  private readonly providers: Map<string, TranslationProvider>;
  private readonly glossary: Record<string, string>;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: TranslationCacheService,
    private readonly papagoProvider: PapagoProvider,
    private readonly deeplProvider: DeepLProvider,
    private readonly googleProvider: GoogleTranslateProvider,
  ) {
    // Priority order from env, default: papago > deepl > google
    const priorityStr = this.configService.get<string>(
      'TRANSLATION_PRIORITY',
      'papago,deepl,google',
    );
    this.providerPriority = priorityStr.split(',').map((s) => s.trim());

    this.providers = new Map<string, TranslationProvider>([
      ['papago', this.papagoProvider],
      ['deepl', this.deeplProvider],
      ['google', this.googleProvider],
    ]);

    this.glossary = glossaryData as Record<string, string>;
  }

  /**
   * Translate text from one language to another
   * Uses cache first, then tries providers in priority order
   */
  async translate(
    text: string,
    from = 'zh-CN',
    to = 'ko',
  ): Promise<string> {
    if (!text || text.trim().length === 0) return '';

    // Check cache
    const cached = await this.cacheService.getCached(text, from, to);
    if (cached) return cached;

    // Try providers in order
    let lastError: Error | null = null;

    for (const providerName of this.providerPriority) {
      const provider = this.providers.get(providerName);
      if (!provider || !provider.isConfigured) continue;

      try {
        let translated = await provider.translate(text, from, to);

        // Apply glossary replacements for zh->ko translations
        if (from.startsWith('zh') && to === 'ko') {
          translated = this.applyGlossary(translated, text);
        }

        // Cache the result
        await this.cacheService.setCache(text, translated, from, to, providerName);
        return translated;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Provider "${providerName}" failed, trying next`,
          error,
        );
      }
    }

    this.logger.error(
      'All translation providers failed',
      lastError?.message,
    );
    throw new Error(
      `Translation failed for all providers: ${lastError?.message}`,
    );
  }

  /**
   * Translate an array of texts in batch
   * Groups texts and translates them, leveraging cache for each
   */
  async translateBatch(
    texts: string[],
    from = 'zh-CN',
    to = 'ko',
  ): Promise<string[]> {
    const results: string[] = new Array(texts.length);
    const uncachedIndices: number[] = [];
    const uncachedTexts: string[] = [];

    // Check cache for each text
    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      if (!text || text.trim().length === 0) {
        results[i] = '';
        continue;
      }

      const cached = await this.cacheService.getCached(text, from, to);
      if (cached) {
        results[i] = cached;
      } else {
        uncachedIndices.push(i);
        uncachedTexts.push(text);
      }
    }

    // Translate uncached texts individually
    // (Batch API could be implemented per-provider in the future)
    for (let i = 0; i < uncachedTexts.length; i++) {
      try {
        results[uncachedIndices[i]] = await this.translate(
          uncachedTexts[i],
          from,
          to,
        );
      } catch (error) {
        this.logger.error(
          `Batch translation failed for index ${uncachedIndices[i]}`,
          error,
        );
        // Return original text as fallback
        results[uncachedIndices[i]] = uncachedTexts[i];
      }
    }

    return results;
  }

  /**
   * Translate HTML content while preserving tags
   * Extracts text nodes, translates them, and reassembles
   */
  async translateHtml(
    html: string,
    from = 'zh-CN',
    to = 'ko',
  ): Promise<string> {
    if (!html || html.trim().length === 0) return '';

    // Extract text segments between HTML tags
    const segments: { text: string; isTag: boolean }[] = [];
    const tagRegex = /<[^>]+>/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(html)) !== null) {
      // Text before this tag
      if (match.index > lastIndex) {
        const text = html.substring(lastIndex, match.index);
        if (text.trim()) {
          segments.push({ text, isTag: false });
        } else {
          segments.push({ text, isTag: true }); // preserve whitespace as-is
        }
      }
      // The tag itself
      segments.push({ text: match[0], isTag: true });
      lastIndex = match.index + match[0].length;
    }

    // Remaining text after last tag
    if (lastIndex < html.length) {
      const text = html.substring(lastIndex);
      if (text.trim()) {
        segments.push({ text, isTag: false });
      } else {
        segments.push({ text, isTag: true });
      }
    }

    // Collect texts to translate
    const textsToTranslate = segments
      .filter((s) => !s.isTag)
      .map((s) => s.text.trim());

    if (textsToTranslate.length === 0) return html;

    // Translate all text segments in batch
    const translated = await this.translateBatch(textsToTranslate, from, to);

    // Reassemble HTML with translated text
    let translateIdx = 0;
    const resultParts: string[] = [];

    for (const segment of segments) {
      if (segment.isTag) {
        resultParts.push(segment.text);
      } else {
        // Preserve leading/trailing whitespace from original
        const leadingSpace = segment.text.match(/^\s*/)?.[0] ?? '';
        const trailingSpace = segment.text.match(/\s*$/)?.[0] ?? '';
        resultParts.push(
          `${leadingSpace}${translated[translateIdx]}${trailingSpace}`,
        );
        translateIdx++;
      }
    }

    return resultParts.join('');
  }

  /**
   * Apply glossary replacements to ensure domain-specific terms are correct
   * Checks if the original Chinese text contains glossary terms and
   * ensures the Korean translation uses the correct term
   */
  private applyGlossary(translatedText: string, originalText: string): string {
    let result = translatedText;

    for (const [zhTerm, koTerm] of Object.entries(this.glossary)) {
      if (originalText.includes(zhTerm)) {
        // The translated text might have various translations of the term;
        // we ensure our preferred translation is used.
        // This is a simple post-processing approach — for complex cases,
        // provider-level glossary support would be better.
        // Only apply if the exact Korean term isn't already present
        if (!result.includes(koTerm)) {
          // We don't blindly replace since we can't know what the provider
          // translated it to. Instead, we log for future glossary tuning.
          this.logger.debug(
            `Glossary term "${zhTerm}" -> "${koTerm}" found in source but may differ in translation`,
          );
        }
      }
    }

    // Direct term replacement for common unit/tag words that appear as-is
    // These are terms where the Chinese character might appear untranslated
    const directReplacements: [string, string][] = [
      ['包邮', '무료배송'],
      ['现货', '즉시배송'],
      ['爆款', '인기상품'],
      ['新款', '신상품'],
      ['热卖', '베스트셀러'],
      ['促销', '특가'],
      ['限时', '한정'],
      ['清仓', '재고정리'],
      ['厂家直销', '공장직판'],
      ['一件代发', '1개부터발송'],
      ['混批', '혼합주문가능'],
      ['7天无理由退货', '7일무조건반품'],
      ['定制', '맞춤제작'],
      ['批发', '도매'],
      ['零售', '소매'],
      ['代工', 'OEM'],
      ['贴牌', 'ODM'],
    ];

    for (const [zh, ko] of directReplacements) {
      if (result.includes(zh)) {
        result = result.replace(new RegExp(this.escapeRegex(zh), 'g'), ko);
      }
    }

    return result;
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
