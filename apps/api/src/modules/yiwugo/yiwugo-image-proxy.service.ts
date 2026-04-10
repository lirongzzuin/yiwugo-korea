import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ThumbnailUrls {
  thumbnail: string; // 120x120
  medium: string; // 400x400
  original: string;
}

@Injectable()
export class YiwugoImageProxyService {
  private readonly logger = new Logger(YiwugoImageProxyService.name);
  private readonly proxyBasePath: string;

  constructor(private readonly configService: ConfigService) {
    this.proxyBasePath = this.configService.get<string>(
      'IMAGE_PROXY_BASE_URL',
      '/api/images/proxy',
    );
  }

  /**
   * Convert a Yiwugo image URL to a proxied URL that avoids CORS issues
   * The proxy endpoint will fetch the image server-side and serve it
   */
  getProxiedUrl(originalUrl: string): string {
    if (!originalUrl) return '';

    try {
      const encoded = encodeURIComponent(originalUrl);
      return `${this.proxyBasePath}?url=${encoded}`;
    } catch (error) {
      this.logger.warn(`Failed to proxy URL: ${originalUrl}`, error);
      return originalUrl;
    }
  }

  /**
   * Generate thumbnail URLs at different sizes
   * Uses Yiwugo's built-in image resizing if the URL supports it,
   * otherwise falls back to proxy with size params
   */
  generateThumbnailUrls(originalUrl: string): ThumbnailUrls {
    if (!originalUrl) {
      return { thumbnail: '', medium: '', original: '' };
    }

    // If it's a Yiwugo CDN URL, try to use their resizing params
    if (originalUrl.includes('img.yiwugo.com')) {
      return {
        thumbnail: this.appendSizeSuffix(originalUrl, '_120x120'),
        medium: this.appendSizeSuffix(originalUrl, '_400x400'),
        original: this.getProxiedUrl(originalUrl),
      };
    }

    // For other URLs, use our proxy with size query params
    const encoded = encodeURIComponent(originalUrl);
    return {
      thumbnail: `${this.proxyBasePath}?url=${encoded}&w=120&h=120`,
      medium: `${this.proxyBasePath}?url=${encoded}&w=400&h=400`,
      original: `${this.proxyBasePath}?url=${encoded}`,
    };
  }

  /**
   * Append a size suffix before the file extension
   * e.g. image.jpg -> image_120x120.jpg
   */
  private appendSizeSuffix(url: string, suffix: string): string {
    const lastDot = url.lastIndexOf('.');
    if (lastDot === -1) {
      return this.getProxiedUrl(`${url}${suffix}`);
    }

    const base = url.substring(0, lastDot);
    const ext = url.substring(lastDot);
    return this.getProxiedUrl(`${base}${suffix}${ext}`);
  }
}
