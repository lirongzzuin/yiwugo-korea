import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface NaverUserInfo {
  id: string;
  email?: string;
  name?: string;
  profileImage?: string;
  phone?: string;
}

@Injectable()
export class NaverStrategy {
  private readonly logger = new Logger(NaverStrategy.name);
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('NAVER_CLIENT_ID', '');
    this.clientSecret = this.configService.get<string>('NAVER_CLIENT_SECRET', '');
  }

  async authenticate(code: string, redirectUri: string): Promise<NaverUserInfo> {
    // Step 1: Exchange authorization code for access token
    const tokenResponse = await axios.post(
      'https://nid.naver.com/oauth2.0/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: redirectUri,
          code,
        },
      },
    );

    const accessToken = tokenResponse.data.access_token;

    // Step 2: Get user info
    const userResponse = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const naverUser = userResponse.data.response;

    return {
      id: naverUser.id,
      email: naverUser.email,
      name: naverUser.name || naverUser.nickname,
      profileImage: naverUser.profile_image,
      phone: naverUser.mobile?.replace(/-/g, ''),
    };
  }
}
