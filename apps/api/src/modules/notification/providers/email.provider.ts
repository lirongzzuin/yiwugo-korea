import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log('Email transporter configured');
    } else {
      this.logger.warn('SMTP not configured, email sending disabled');
    }
  }

  get isConfigured(): boolean {
    return this.transporter !== null;
  }

  /**
   * Send an email
   */
  async send(message: EmailMessage): Promise<{ success: boolean; messageId?: string }> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not configured, skipping send');
      return { success: false };
    }

    try {
      const from = this.configService.get<string>(
        'SMTP_FROM',
        'noreply@yiwugo.co.kr',
      );

      const info = await this.transporter.sendMail({
        from: `"이우고 코리아" <${from}>`,
        to: message.to,
        subject: message.subject,
        html: message.html,
      });

      this.logger.log(`Email sent: ${info.messageId} to ${message.to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Failed to send email to ${message.to}`, error);
      return { success: false };
    }
  }
}
