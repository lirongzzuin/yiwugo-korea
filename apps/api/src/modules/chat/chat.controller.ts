import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { CurrentUser, JwtPayload } from '@common/decorators/current-user.decorator';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@ApiBearerAuth()
@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  @ApiOperation({ summary: '내 채팅방 목록 조회' })
  async getRooms(@CurrentUser() user: JwtPayload) {
    return this.chatService.getChatRooms(user.sub);
  }

  @Get('rooms/:id/messages')
  @ApiOperation({ summary: '채팅 메시지 조회' })
  async getMessages(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.chatService.getMessages(
      id,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 30,
    );
  }

  @Post('rooms')
  @ApiOperation({ summary: '채팅방 생성 (또는 기존 반환)' })
  async createRoom(
    @CurrentUser() user: JwtPayload,
    @Body() body: { shopId: string; shopName: string },
  ) {
    return this.chatService.createRoom(user.sub, body.shopId, body.shopName);
  }

  @Post('rooms/:id/messages')
  @ApiOperation({ summary: '메시지 전송' })
  async sendMessage(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body()
    body: {
      content: string;
      senderType?: string;
      imageUrl?: string;
      productId?: string;
    },
  ) {
    return this.chatService.sendMessage(
      id,
      user.sub,
      body.senderType || 'USER',
      body.content,
      body.imageUrl,
      body.productId,
    );
  }

  @Patch('rooms/:id/read')
  @ApiOperation({ summary: '메시지 읽음 처리' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.chatService.markAsRead(id, user.sub);
    return { success: true };
  }
}
