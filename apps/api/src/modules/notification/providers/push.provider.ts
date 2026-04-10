import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PushMessage {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

@Injectable()
export class PushProvider {
  private readonly logger = new Logger(PushProvider.name);
  private readonly serviceAccountKey: string;

  constructor(private readonly configService: ConfigService) {
    this.serviceAccountKey = this.configService.get<string>(
      'FCM_SERVICE_ACCOUNT_KEY',
      '',
    );
  }

  get isConfigured(): boolean {
    return !!this.serviceAccountKey;
  }

  /**
   * Send FCM push notification
   * TODO: Integrate with Firebase Admin SDK
   */
  async send(message: PushMessage): Promise<{ success: boolean; messageId?: string }> {
    if (!this.isConfigured) {
      this.logger.warn('FCM is not configured, skipping push');
      return { success: false };
    }

    this.logger.log(
      `[STUB] Sending push to token=${message.token.substring(0, 20)}..., title=${message.title}`,
    );

    // TODO: Implement with Firebase Admin SDK
    // import * as admin from 'firebase-admin';
    // const response = await admin.messaging().send({
    //   token: message.token,
    //   notification: { title: message.title, body: message.body, imageUrl: message.imageUrl },
    //   data: message.data,
    // });

    return { success: true, messageId: `stub-${Date.now()}` };
  }

  /**
   * Send to multiple devices
   */
  async sendMulticast(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<{ successCount: number; failureCount: number }> {
    if (!this.isConfigured || tokens.length === 0) {
      return { successCount: 0, failureCount: tokens.length };
    }

    this.logger.log(
      `[STUB] Sending multicast push to ${tokens.length} devices`,
    );

    // TODO: Implement with Firebase Admin SDK
    return { successCount: tokens.length, failureCount: 0 };
  }
}
