import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

export interface JwtRefreshPayload {
  sub: string;
  email: string;
  role: string;
  memberType: string;
  type: 'refresh';
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => {
        const token = req?.cookies?.['refresh_token'];
        if (!token) {
          return null;
        }
        return token;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.refreshSecret'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtRefreshPayload) {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('유효하지 않은 토큰 타입입니다.');
    }

    const refreshToken = req.cookies?.['refresh_token'];

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      memberType: payload.memberType,
      refreshToken,
    };
  }
}
