import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface KakaoUserInfo {
  id: string;
  email?: string;
  name?: string;
  profileImage?: string;
}

@Injectable()
export class KakaoStrategy {
  private readonly logger = new Logger(KakaoStrategy.name);
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('KAKAO_CLIENT_ID', '');
    this.clientSecret = this.configService.get<string>('KAKAO_CLIENT_SECRET', '');
  }

  async authenticate(code: string, redirectUri: string): Promise<KakaoUserInfo> {
    // Step 1: Exchange authorization code for access token
    const tokenResponse = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: redirectUri,
          code,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      },
    );

    const accessToken = tokenResponse.data.access_token;

    // Step 2: Get user info
    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    const kakaoUser = userResponse.data;
    const kakaoAccount = kakaoUser.kakao_account;
    const profile = kakaoAccount?.profile;

    return {
      id: String(kakaoUser.id),
      email: kakaoAccount?.email,
      name: profile?.nickname,
      profileImage: profile?.profile_image_url,
    };
  }
}
