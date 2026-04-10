import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ChatTranslationService } from './chat-translation.service';

@WebSocketGateway({ cors: true, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly chatTranslationService: ChatTranslationService,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, roomId: string) {
    client.join(roomId);
    this.logger.debug(`Client ${client.id} joined room ${roomId}`);
    return { event: 'joinedRoom', data: { roomId } };
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    payload: {
      roomId: string;
      senderId: string;
      content: string;
      senderType?: string;
      imageUrl?: string;
      productId?: string;
      targetLang?: string;
    },
  ) {
    const message = await this.chatService.sendMessage(
      payload.roomId,
      payload.senderId,
      payload.senderType || 'USER',
      payload.content,
      payload.imageUrl,
      payload.productId,
    );

    // Auto-translate if target language is specified
    let translatedContent: string | null = null;
    if (payload.targetLang) {
      translatedContent = await this.chatTranslationService.translateMessage(
        payload.content,
        payload.targetLang,
      );
    }

    const emitPayload = {
      ...message,
      translatedContent,
    };

    this.server.to(payload.roomId).emit('newMessage', emitPayload);

    return { event: 'messageSent', data: emitPayload };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, roomId: string) {
    client.leave(roomId);
    this.logger.debug(`Client ${client.id} left room ${roomId}`);
    return { event: 'leftRoom', data: { roomId } };
  }

  @SubscribeMessage('markRead')
  async handleMarkRead(
    client: Socket,
    payload: { roomId: string; userId: string },
  ) {
    await this.chatService.markAsRead(payload.roomId, payload.userId);
    this.server.to(payload.roomId).emit('messagesRead', {
      roomId: payload.roomId,
      userId: payload.userId,
    });
    return { event: 'markedRead', data: { roomId: payload.roomId } };
  }
}
