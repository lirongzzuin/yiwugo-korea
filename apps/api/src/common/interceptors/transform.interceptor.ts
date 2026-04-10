import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((response) => {
        // If the response already has a success property, pass through
        if (response && typeof response === 'object' && 'success' in response) {
          return response;
        }

        // If the response contains pagination metadata
        if (response && typeof response === 'object' && 'items' in response && 'total' in response) {
          return {
            success: true,
            data: response.items,
            meta: {
              page: response.page,
              pageSize: response.pageSize,
              total: response.total,
              totalPages: response.pageSize
                ? Math.ceil(response.total / response.pageSize)
                : undefined,
            },
          };
        }

        return {
          success: true,
          data: response,
        };
      }),
    );
  }
}
