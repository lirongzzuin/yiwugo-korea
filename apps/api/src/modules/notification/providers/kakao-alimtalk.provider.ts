import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AlimTalkMessage {
  phoneNumber: string;
  templateCode: string;
  variables: Record<string, string>;
}

@Injectable()
export class KakaoAlimTalkProvider {
  private readonly logger = new Logger(KakaoAlimTalkProvider.name);
  private readonly apiKey: string;
  private readonly senderKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('KAKAO_ALIMTALK_API_KEY', '');
    this.senderKey = this.configService.get<string>('KAKAO_ALIMTALK_SENDER_KEY', '');
  }

  get isConfigured(): boolean {
    return !!(this.apiKey && this.senderKey);
  }

  /**
   * Send Kakao AlimTalk message
   * TODO: Integrate with actual Kakao AlimTalk API (e.g., NHN Cloud or Solapi)
   */
  async send(message: AlimTalkMessage): Promise<{ success: boolean; messageId?: string }> {
    if (!this.isConfigured) {
      this.logger.warn('KakaoAlimTalk is not configured, skipping send');
      return { success: false };
    }

    this.logger.log(
      `[STUB] Sending AlimTalk to ${message.phoneNumber}, template=${message.templateCode}`,
    );

    // TODO: Implement actual API call
    // const response = await axios.post('https://api-alimtalk.cloud.toast.com/...', {
    //   senderKey: this.senderKey,
    //   templateCode: message.templateCode,
    //   recipientList: [{
    //     recipientNo: message.phoneNumber,
    //     templateParameter: message.variables,
    //   }],
    // }, {
    //   headers: { 'X-Secret-Key': this.apiKey },
    // });

    return { success: true, messageId: `stub-${Date.now()}` };
  }
}
