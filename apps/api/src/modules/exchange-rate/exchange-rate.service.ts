import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { RedisService } from '@common/services/redis.service';
import { PrismaService } from '@prisma/prisma.service';

const REDIS_KEY = 'exchange-rate:CNY:KRW';
const REDIS_TTL = 300; // 5 minutes
const REDIS_MANUAL_KEY = 'exchange-rate:CNY:KRW:manual';

export interface ExchangeRateResult {
  rate: number;
  source: string;
  updatedAt: Date;
  isManualOverride: boolean;
}

export interface ExchangeRateLog {
  id: string;
  rate: number;
  source: string;
  recordedAt: Date;
}

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);
  private readonly koreaEximApiKey: string;
  private readonly exchangeRateApiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService,
  ) {
    this.koreaEximApiKey = this.configService.get<string>(
      'KOREA_EXIM_API_KEY',
      '',
    );
    this.exchangeRateApiKey = this.configService.get<string>(
      'EXCHANGE_RATE_API_KEY',
      '',
    );
  }

  /**
   * Get the current CNY→KRW exchange rate
   * Checks: manual override -> Redis cache -> external API
   */
  async getCurrentRate(): Promise<ExchangeRateResult> {
    // 1. Check for admin manual override
    try {
      const manualRaw = await this.redisService.get(REDIS_MANUAL_KEY);
      if (manualRaw) {
        const manual = JSON.parse(manualRaw);
        return {
          rate: manual.rate,
          source: 'manual',
          updatedAt: new Date(manual.updatedAt),
          isManualOverride: true,
        };
      }
    } catch {
      // ignore
    }

    // 2. Check Redis cache
    try {
      const cached = await this.redisService.get(REDIS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return {
          rate: parsed.rate,
          source: parsed.source,
          updatedAt: new Date(parsed.updatedAt),
          isManualOverride: false,
        };
      }
    } catch {
      // ignore
    }

    // 3. Fetch from external API
    return this.fetchRate();
  }

  /**
   * Get exchange rate history from ExchangeRate table
   */
  async getHistoryRates(days = 30): Promise<ExchangeRateLog[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const records = await this.prisma.exchangeRate.findMany({
      where: {
        fromCurrency: 'CNY',
        toCurrency: 'KRW',
        recordedAt: { gte: since },
      },
      orderBy: { recordedAt: 'desc' },
      take: 1000,
    });

    return records.map((r: { id: string; rate: any; source: string; recordedAt: Date }) => ({
      id: r.id,
      rate: Number(r.rate),
      source: r.source,
      recordedAt: r.recordedAt,
    }));
  }

  /**
   * Set a manual override exchange rate (admin only)
   * The manual rate persists until cleared or overwritten
   */
  async setManualRate(rate: number, adminId: string): Promise<void> {
    const now = new Date();

    // Store in Redis (no TTL — persists until cleared)
    await this.redisService.set(
      REDIS_MANUAL_KEY,
      JSON.stringify({ rate, updatedAt: now.toISOString(), adminId }),
    );

    // Log to DB
    await this.prisma.exchangeRate.create({
      data: {
        fromCurrency: 'CNY',
        toCurrency: 'KRW',
        rate,
        source: `manual:${adminId}`,
        recordedAt: now,
      },
    });

    this.logger.log(`Manual exchange rate set to ${rate} by admin ${adminId}`);
  }

  /**
   * Clear manual override, reverting to automatic rate
   */
  async clearManualRate(): Promise<void> {
    await this.redisService.del(REDIS_MANUAL_KEY);
    this.logger.log('Manual exchange rate override cleared');
  }

  /**
   * Fetch rate from external sources, cache, and return
   * Called by the scheduler and as fallback
   */
  async fetchRate(): Promise<ExchangeRateResult> {
    let rate: number | null = null;
    let source = 'unknown';

    // Try Korea Exim Bank first
    try {
      rate = await this.fetchFromKoreaExim();
      source = 'korea-exim';
    } catch (error) {
      this.logger.warn('Korea Exim Bank API failed, trying fallback', error);
    }

    // Fallback to exchangerate-api
    if (rate === null) {
      try {
        rate = await this.fetchFromExchangeRateApi();
        source = 'exchangerate-api';
      } catch (error) {
        this.logger.warn('ExchangeRate API fallback also failed', error);
      }
    }

    // Last resort: use latest DB record
    if (rate === null) {
      const latest = await this.prisma.exchangeRate.findFirst({
        where: { fromCurrency: 'CNY', toCurrency: 'KRW' },
        orderBy: { recordedAt: 'desc' },
      });

      if (latest) {
        rate = Number(latest.rate);
        source = `db-fallback:${latest.source}`;
        this.logger.warn(`Using DB fallback rate: ${rate}`);
      } else {
        // Absolute last resort: hardcoded approximate rate
        rate = 190;
        source = 'hardcoded-default';
        this.logger.error('No exchange rate available, using hardcoded default');
      }
    }

    const now = new Date();
    const result: ExchangeRateResult = {
      rate,
      source,
      updatedAt: now,
      isManualOverride: false,
    };

    // Cache in Redis
    try {
      await this.redisService.set(
        REDIS_KEY,
        JSON.stringify({ rate, source, updatedAt: now.toISOString() }),
        REDIS_TTL,
      );
    } catch {
      // ignore cache write errors
    }

    return result;
  }

  /**
   * Fetch from Korea Exim Bank Open API (한국수출입은행)
   * Endpoint: https://www.koreaexim.go.kr/site/program/financial/exchangeJSON
   */
  private async fetchFromKoreaExim(): Promise<number> {
    if (!this.koreaEximApiKey) {
      throw new Error('Korea Exim API key not configured');
    }

    const today = new Date();
    const searchDate = this.formatDate(today);

    const response = await axios.get(
      'https://www.koreaexim.go.kr/site/program/financial/exchangeJSON',
      {
        params: {
          authkey: this.koreaEximApiKey,
          searchdate: searchDate,
          data: 'AP01',
        },
        timeout: 10_000,
      },
    );

    const data = response.data;
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Empty response from Korea Exim Bank');
    }

    // Find CNY rate
    const cnyEntry = data.find(
      (entry: any) => entry.cur_unit === 'CNY',
    );

    if (!cnyEntry) {
      throw new Error('CNY rate not found in Korea Exim Bank response');
    }

    // deal_bas_r is the base rate (string with commas like "190.25")
    const rateStr = String(cnyEntry.deal_bas_r).replace(/,/g, '');
    const rate = parseFloat(rateStr);

    if (isNaN(rate) || rate <= 0) {
      throw new Error(`Invalid CNY rate from Korea Exim: ${cnyEntry.deal_bas_r}`);
    }

    return rate;
  }

  /**
   * Fallback: fetch from exchangerate-api.com
   */
  private async fetchFromExchangeRateApi(): Promise<number> {
    const apiKey = this.exchangeRateApiKey;
    const url = apiKey
      ? `https://v6.exchangerate-api.com/v6/${apiKey}/pair/CNY/KRW`
      : 'https://open.er-api.com/v6/latest/CNY';

    const response = await axios.get(url, { timeout: 10_000 });

    if (apiKey) {
      // Paid API response
      const rate = response.data?.conversion_rate;
      if (!rate || isNaN(rate)) {
        throw new Error('Invalid rate from exchangerate-api');
      }
      return rate;
    }

    // Free API response
    const rates = response.data?.rates;
    if (!rates?.KRW) {
      throw new Error('KRW rate not found in exchangerate-api response');
    }
    return rates.KRW;
  }

  /**
   * Format date as YYYYMMDD for Korea Exim Bank API
   */
  private formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
  }
}
