import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only log mutating operations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const user = request.user;
    if (!user || user.role !== 'ADMIN') {
      return next.handle();
    }

    const action =
      method === 'POST'
        ? 'CREATE'
        : method === 'DELETE'
          ? 'DELETE'
          : 'UPDATE';
    const resource = context
      .getClass()
      .name.replace('Controller', '')
      .toLowerCase();
    const resourceId = request.params?.id;

    return next.handle().pipe(
      tap((response) => {
        this.auditService
          .log({
            adminId: user.sub || user.id,
            adminName: user.name || user.email || 'Admin',
            action,
            resource,
            resourceId,
            newValue: request.body,
            ipAddress: request.ip,
            userAgent: request.headers['user-agent'],
          })
          .catch(() => {}); // Fire and forget
      }),
    );
  }
}
