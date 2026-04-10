import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { Logger as WinstonLogger } from 'winston';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: WinstonLogger) {}

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode: number;
    let message: string;
    let code: string;

    switch (exception.code) {
      case 'P2002': {
        // Unique constraint violation
        const target = (exception.meta?.target as string[])?.join(', ') || 'field';
        statusCode = HttpStatus.CONFLICT;
        message = `이미 존재하는 ${target} 값입니다.`;
        code = 'DUPLICATE_ENTRY';
        break;
      }
      case 'P2025': {
        // Record not found
        statusCode = HttpStatus.NOT_FOUND;
        message = '요청한 리소스를 찾을 수 없습니다.';
        code = 'NOT_FOUND';
        break;
      }
      case 'P2003': {
        // Foreign key constraint failed
        statusCode = HttpStatus.BAD_REQUEST;
        message = '관련된 리소스가 존재하지 않습니다.';
        code = 'FOREIGN_KEY_ERROR';
        break;
      }
      case 'P2014': {
        // Required relation violation
        statusCode = HttpStatus.BAD_REQUEST;
        message = '필수 관계 데이터가 누락되었습니다.';
        code = 'RELATION_VIOLATION';
        break;
      }
      case 'P2021': {
        // Table does not exist
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message = '내부 서버 오류가 발생했습니다.';
        code = 'TABLE_NOT_FOUND';
        break;
      }
      case 'P2022': {
        // Column does not exist
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message = '내부 서버 오류가 발생했습니다.';
        code = 'COLUMN_NOT_FOUND';
        break;
      }
      default: {
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        message = '데이터베이스 오류가 발생했습니다.';
        code = 'DATABASE_ERROR';
        break;
      }
    }

    this.logger.error('Prisma error', {
      prismaCode: exception.code,
      message: exception.message,
      meta: exception.meta,
      path: request.url,
      method: request.method,
    });

    response.status(statusCode).json({
      success: false,
      error: {
        code,
        message,
        statusCode,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
