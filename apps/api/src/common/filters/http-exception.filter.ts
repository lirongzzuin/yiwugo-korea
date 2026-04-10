import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger as WinstonLogger } from 'winston';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: WinstonLogger) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string;
    let code: string;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
      code = HttpStatus[statusCode] || 'UNKNOWN_ERROR';
    } else if (typeof exceptionResponse === 'object') {
      const resp = exceptionResponse as Record<string, any>;
      message = Array.isArray(resp.message) ? resp.message.join(', ') : resp.message || exception.message;
      code = resp.error || HttpStatus[statusCode] || 'UNKNOWN_ERROR';
    } else {
      message = exception.message;
      code = HttpStatus[statusCode] || 'UNKNOWN_ERROR';
    }

    const errorBody = {
      success: false,
      error: {
        code,
        message,
        statusCode,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (statusCode >= 500) {
      this.logger.error('Server error', {
        statusCode,
        message,
        path: request.url,
        method: request.method,
        stack: exception.stack,
      });
    } else {
      this.logger.warn('Client error', {
        statusCode,
        message,
        path: request.url,
        method: request.method,
      });
    }

    response.status(statusCode).json(errorBody);
  }
}
