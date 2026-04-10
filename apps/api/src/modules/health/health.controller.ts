import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

interface ServiceStatus {
  status: 'up' | 'down';
  latencyMs?: number;
  error?: string;
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: ServiceStatus;
    redis: ServiceStatus;
    yiwugoApi: ServiceStatus;
  };
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly prisma: PrismaClient;

  constructor(private readonly configService: ConfigService) {
    this.prisma = new PrismaClient();
  }

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'Service health status',
  })
  async check(): Promise<HealthResponse> {
    const [database, redis, yiwugoApi] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkYiwugoApi(),
    ]);

    const services = { database, redis, yiwugoApi };

    const allUp = Object.values(services).every((s) => s.status === 'up');
    const allDown = Object.values(services).every((s) => s.status === 'down');

    let status: 'ok' | 'degraded' | 'down';
    if (allUp) {
      status = 'ok';
    } else if (allDown) {
      status = 'down';
    } else {
      status = 'degraded';
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
      services,
    };
  }

  private async checkDatabase(): Promise<ServiceStatus> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'up',
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }

  private async checkRedis(): Promise<ServiceStatus> {
    const start = Date.now();
    const redisUrl = this.configService.get<string>('redis.url', 'redis://localhost:6379');

    let redis: Redis | null = null;
    try {
      redis = new Redis(redisUrl, {
        connectTimeout: 3000,
        lazyConnect: true,
      });
      await redis.connect();
      await redis.ping();
      return {
        status: 'up',
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown Redis error',
      };
    } finally {
      if (redis) {
        try {
          await redis.quit();
        } catch {
          // ignore cleanup errors
        }
      }
    }
  }

  private async checkYiwugoApi(): Promise<ServiceStatus> {
    const start = Date.now();
    const yiwugoApiUrl = this.configService.get<string>(
      'YIWUGO_API_BASE_URL',
      'https://api.yiwugo.com',
    );

    try {
      await axios.get(`${yiwugoApiUrl}/health`, {
        timeout: 5000,
        validateStatus: (status) => status < 500,
      });
      return {
        status: 'up',
        latencyMs: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'down',
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : 'Unknown Yiwugo API error',
      };
    }
  }
}
