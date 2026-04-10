import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { createPublicKey } from 'crypto';

export interface AppleUserInfo {
  id: string;
  email?: string;
}

interface AppleJWK {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

@Injectable()
export class AppleStrategy {
  private readonly logger = new Logger(AppleStrategy.name);
  private readonly clientId: string;

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('APPLE_CLIENT_ID', '');
  }

  async authenticate(idToken: string): Promise<AppleUserInfo> {
    try {
      // Step 1: Fetch Apple's public keys
      const keysResponse = await axios.get('https://appleid.apple.com/auth/keys');
      const keys: AppleJWK[] = keysResponse.data.keys;

      // Step 2: Decode JWT header to find the matching key
      const decodedHeader = jwt.decode(idToken, { complete: true });
      if (!decodedHeader) {
        throw new UnauthorizedException('Apple 토큰을 디코딩할 수 없습니다.');
      }

      const matchingKey = keys.find((key) => key.kid === decodedHeader.header.kid);
      if (!matchingKey) {
        throw new UnauthorizedException('Apple 공개 키를 찾을 수 없습니다.');
      }

      // Step 3: Convert JWK to PEM
      const publicKey = createPublicKey({
        key: {
          kty: matchingKey.kty,
          n: matchingKey.n,
          e: matchingKey.e,
        },
        format: 'jwk',
      });

      const pem = publicKey.export({ type: 'spki', format: 'pem' }) as string;

      // Step 4: Verify the token
      const payload = jwt.verify(idToken, pem, {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
        audience: this.clientId,
      }) as any;

      return {
        id: payload.sub,
        email: payload.email,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('Apple token verification failed', error);
      throw new UnauthorizedException('Apple 인증에 실패했습니다.');
    }
  }
}
