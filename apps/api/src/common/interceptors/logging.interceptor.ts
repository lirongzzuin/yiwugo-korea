import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger as WinstonLogger } from 'winston';

const SENSITIVE_FIELDS = ['password', 'token', 'accessToken', 'refreshToken', 'secret', 'apiKey'];

function maskSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }

  const masked: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FIELDS.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
      masked[key] = '***MASKED***';
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveData(value);
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: WinstonLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const userId = request.user?.id || 'anonymous';
    const startTime = Date.now();

    this.logger.debug('Incoming request', {
      method,
      url,
      userId,
      ip,
      userAgent: userAgent.substring(0, 100),
      body: body ? maskSensitiveData(body) : undefined,
    });

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const response = context.switchToHttp().getResponse();

          this.logger.info('Request completed', {
            method,
            url,
            statusCode: response.statusCode,
            duration: `${duration}ms`,
            userId,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          this.logger.error('Request failed', {
            method,
            url,
            statusCode: error.status || 500,
            duration: `${duration}ms`,
            userId,
            error: error.message,
          });
        },
      }),
    );
  }
}
