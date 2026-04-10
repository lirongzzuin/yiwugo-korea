import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@common/services/redis.service';

/**
 * Tracks and retrieves popular search keywords using Redis.
 * Uses a JSON-serialized map stored in a single Redis key,
 * since the project's RedisService exposes basic get/set/incr operations only.
 */
@Injectable()
export class PopularKeywordsService {
  private readonly logger = new Logger(PopularKeywordsService.name);
  private static readonly REDIS_KEY = 'popular_keywords';

  constructor(private redis: RedisService) {}

  async getPopularKeywords(
    limit = 20,
  ): Promise<{ keyword: string; count: number }[]> {
    try {
      const raw = await this.redis.get(PopularKeywordsService.REDIS_KEY);
      if (!raw) return [];

      const map: Record<string, number> = JSON.parse(raw);
      return Object.entries(map)
        .map(([keyword, count]) => ({ keyword, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      this.logger.error('Failed to get popular keywords from Redis', error);
      return [];
    }
  }

  async trackKeyword(keyword: string): Promise<void> {
    try {
      const normalized = keyword.trim().toLowerCase();
      if (!normalized) return;

      const raw = await this.redis.get(PopularKeywordsService.REDIS_KEY);
      const map: Record<string, number> = raw ? JSON.parse(raw) : {};
      map[normalized] = (map[normalized] || 0) + 1;

      await this.redis.set(PopularKeywordsService.REDIS_KEY, JSON.stringify(map));
    } catch (error) {
      this.logger.error(`Failed to track keyword: ${keyword}`, error);
    }
  }
}
