import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(params: {
    adminId: string;
    adminName: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      return await this.prisma.auditLog.create({
        data: {
          adminId: params.adminId,
          adminName: params.adminName,
          action: params.action,
          targetType: params.resource,
          targetId: params.resourceId || '',
          before: params.oldValue
            ? JSON.parse(JSON.stringify(params.oldValue))
            : undefined,
          after: params.newValue
            ? JSON.parse(JSON.stringify(params.newValue))
            : undefined,
          ipAddress: params.ipAddress || '',
          userAgent: params.userAgent,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      throw error;
    }
  }

  async getLogs(params: {
    adminId?: string;
    resource?: string;
    action?: string;
    from?: Date;
    to?: Date;
    page?: number;
    pageSize?: number;
  }) {
    const { adminId, resource, action, from, to, page = 1, pageSize = 20 } = params;

    const where: any = {};
    if (adminId) where.adminId = adminId;
    if (resource) where.targetType = resource;
    if (action) where.action = action;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = from;
      if (to) where.createdAt.lte = to;
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }
}
