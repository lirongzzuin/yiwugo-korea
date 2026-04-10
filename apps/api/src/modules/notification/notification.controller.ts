import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser, JwtPayload } from '@common/decorators/current-user.decorator';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: '알림 목록 조회' })
  async getNotifications(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.notificationService.getNotifications(
      user.sub,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: '읽지 않은 알림 수' })
  async getUnreadCount(@CurrentUser() user: JwtPayload) {
    const count = await this.notificationService.getUnreadCount(user.sub);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: '알림 읽음 처리' })
  async markAsRead(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.notificationService.markAsRead(user.sub, id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: '전체 알림 읽음 처리' })
  async markAllAsRead(@CurrentUser() user: JwtPayload) {
    return this.notificationService.markAllAsRead(user.sub);
  }
}
