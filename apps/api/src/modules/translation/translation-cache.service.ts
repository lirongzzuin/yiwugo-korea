import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { RedisService } from '@common/services/redis.service';
import { PrismaService } from '@prisma/prisma.service';

const REDIS_TTL = 86400; // 24 hours
const REDIS_KEY_PREFIX = 'translation:';

export interface CachedTranslation {
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  provider: string;
}

@Injectable()
export class TranslationCacheService {
  private readonly logger = new Logger(TranslationCacheService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Look up a cached translation by source text hash
   * Checks Redis first, then falls back to DB
   */
  async getCached(
    sourceText: string,
    sourceLang: string,
    targetLang: string,
  ): Promise<string | null> {
    const hash = this.hashText(sourceText, sourceLang, targetLang);
    const redisKey = `${REDIS_KEY_PREFIX}${hash}`;

    // 1. Check Redis
    try {
      const redisResult = await this.redisService.get(redisKey);
      if (redisResult) {
        return redisResult;
      }
    } catch (error) {
      this.logger.warn('Redis cache read error', error);
    }

    // 2. Check DB TranslationCache table
    try {
      const dbResult = await this.prisma.translationCache.findUnique({
        where: { sourceHash: hash },
      });

      if (dbResult) {
        // Re-populate Redis cache
        await this.redisService
          .set(redisKey, dbResult.targetText, REDIS_TTL)
          .catch(() => {});
        return dbResult.targetText;
      }
    } catch (error) {
      // TranslationCache model might not exist yet in the DB
      this.logger.debug('DB translation cache lookup failed', error);
    }

    return null;
  }

  /**
   * Store a translation in both Redis and DB
   */
  async setCache(
    sourceText: string,
    targetText: string,
    sourceLang: string,
    targetLang: string,
    provider: string,
  ): Promise<void> {
    const hash = this.hashText(sourceText, sourceLang, targetLang);
    const redisKey = `${REDIS_KEY_PREFIX}${hash}`;

    // Write to Redis
    try {
      await this.redisService.set(redisKey, targetText, REDIS_TTL);
    } catch (error) {
      this.logger.warn('Redis cache write error', error);
    }

    // Write to DB
    try {
      await this.prisma.translationCache.upsert({
        where: { sourceHash: hash },
        create: {
          sourceHash: hash,
          sourceText:
            sourceText.length > 5000
              ? sourceText.substring(0, 5000)
              : sourceText,
          targetText,
          sourceLang,
          targetLang,
          provider,
        },
        update: {
          targetText,
          provider,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      // TranslationCache model might not exist yet
      this.logger.debug('DB translation cache write failed', error);
    }
  }

  /**
   * Create a deterministic hash from source text + language pair
   */
  private hashText(
    sourceText: string,
    sourceLang: string,
    targetLang: string,
  ): string {
    const input = `${sourceLang}:${targetLang}:${sourceText}`;
    return crypto.createHash('md5').update(input).digest('hex');
  }
}
