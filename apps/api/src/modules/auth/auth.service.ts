import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/services/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SocialLoginDto, SocialProvider } from './dto/social-login.dto';
import { KakaoStrategy } from './strategies/kakao.strategy';
import { NaverStrategy } from './strategies/naver.strategy';
import { AppleStrategy } from './strategies/apple.strategy';

const LOGIN_FAIL_PREFIX = 'login_fail:';
const LOGIN_LOCK_PREFIX = 'login_lock:';
const RESET_CODE_PREFIX = 'reset_code:';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_SECONDS = 900; // 15 minutes
const RESET_CODE_TTL_SECONDS = 300; // 5 minutes

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly kakaoStrategy: KakaoStrategy,
    private readonly naverStrategy: NaverStrategy,
    private readonly appleStrategy: AppleStrategy,
  ) {}

  // ─── Register ────────────────────────────────────────────

  async register(dto: RegisterDto) {
    if (!dto.agreeTerms || !dto.agreePrivacy) {
      throw new BadRequestException('이용약관과 개인정보 처리방침에 동의해주세요.');
    }

    // Check email uniqueness
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('이미 가입된 이메일 주소입니다.');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create user
    const user = await this.userService.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      phone: dto.phone,
      provider: 'EMAIL',
      memberType: dto.memberType,
      businessNumber: dto.businessNumber,
      marketingConsent: dto.marketingConsent ?? false,
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        memberType: user.memberType,
        role: user.role,
      },
      ...tokens,
    };
  }

  // ─── Login ───────────────────────────────────────────────

  async login(dto: LoginDto) {
    const lockKey = LOGIN_LOCK_PREFIX + dto.email;
    const failKey = LOGIN_FAIL_PREFIX + dto.email;

    // Check if account is locked
    const isLocked = await this.redisService.exists(lockKey);
    if (isLocked) {
      throw new ForbiddenException(
        '로그인 시도 횟수를 초과했습니다. 15분 후에 다시 시도해주세요.',
      );
    }

    // Find user
    const user = await this.userService.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      await this.incrementLoginFailCount(dto.email);
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    // Check active status
    if (!user.isActive) {
      throw new ForbiddenException('비활성화된 계정입니다. 고객센터에 문의해주세요.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      await this.incrementLoginFailCount(dto.email);
      throw new UnauthorizedException('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    // Reset fail count on success
    await this.redisService.del(failKey);

    // Update last login
    await this.userService.updateLastLogin(user.id);

    // Generate tokens
    const tokens = await this.generateTokens(user, dto.keepLoggedIn);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        memberType: user.memberType,
        role: user.role,
      },
      ...tokens,
    };
  }

  // ─── Social Login ────────────────────────────────────────

  async socialLogin(dto: SocialLoginDto) {
    let socialUser: { id: string; email?: string; name?: string; profileImage?: string; phone?: string };

    try {
      switch (dto.provider) {
        case SocialProvider.KAKAO:
          socialUser = await this.kakaoStrategy.authenticate(dto.code, dto.redirectUri);
          break;
        case SocialProvider.NAVER:
          socialUser = await this.naverStrategy.authenticate(dto.code, dto.redirectUri);
          break;
        case SocialProvider.APPLE:
          socialUser = await this.appleStrategy.authenticate(dto.code);
          break;
        default:
          throw new BadRequestException('지원하지 않는 소셜 로그인입니다.');
      }
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Social login failed for ${dto.provider}`, error);
      throw new InternalServerErrorException('소셜 로그인 처리 중 오류가 발생했습니다.');
    }

    // Find existing user by provider + providerId
    let user = await this.userService.findByProvider(dto.provider, socialUser.id);

    if (!user) {
      // Check if email already exists (link accounts)
      if (socialUser.email) {
        user = await this.userService.findByEmail(socialUser.email);
      }

      if (!user) {
        // Create new user
        user = await this.userService.create({
          email: socialUser.email,
          name: socialUser.name,
          phone: (socialUser as any).phone,
          provider: dto.provider,
          providerId: socialUser.id,
          isEmailVerified: !!socialUser.email,
        });
      } else {
        // Link existing account with social provider
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            provider: dto.provider as any,
            providerId: socialUser.id,
          },
        });
      }
    }

    if (!user.isActive) {
      throw new ForbiddenException('비활성화된 계정입니다.');
    }

    await this.userService.updateLastLogin(user.id);

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        memberType: user.memberType,
        role: user.role,
      },
      isNewUser: !user.lastLoginAt,
      ...tokens,
    };
  }

  // ─── Refresh Token ───────────────────────────────────────

  async refreshToken(userId: string, oldRefreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    // Validate stored refresh token matches
    const isValid = await bcrypt.compare(oldRefreshToken, user.refreshToken);
    if (!isValid) {
      // Possible token theft: invalidate all sessions
      await this.userService.updateRefreshToken(userId, null);
      throw new UnauthorizedException('리프레시 토큰이 재사용되었습니다. 다시 로그인해주세요.');
    }

    if (!user.isActive) {
      throw new ForbiddenException('비활성화된 계정입니다.');
    }

    // Rotate: generate new token pair and invalidate old
    const tokens = await this.generateTokens(user);

    return tokens;
  }

  // ─── Logout ──────────────────────────────────────────────

  async logout(userId: string) {
    await this.userService.updateRefreshToken(userId, null);
  }

  // ─── Forgot Password ────────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: '비밀번호 재설정 코드가 이메일로 전송되었습니다.' };
    }

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000));

    // Store in Redis with 5 minute TTL
    const redisKey = RESET_CODE_PREFIX + email;
    await this.redisService.set(redisKey, code, RESET_CODE_TTL_SECONDS);

    // TODO: Send email with code via email service
    this.logger.log(`Password reset code for ${email}: ${code}`);

    return { message: '비밀번호 재설정 코드가 이메일로 전송되었습니다.' };
  }

  // ─── Reset Password ─────────────────────────────────────

  async resetPassword(email: string, code: string, newPassword: string) {
    const redisKey = RESET_CODE_PREFIX + email;
    const storedCode = await this.redisService.get(redisKey);

    if (!storedCode || storedCode !== code) {
      throw new BadRequestException('인증 코드가 유효하지 않거나 만료되었습니다.');
    }

    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('사용자를 찾을 수 없습니다.');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.userService.updatePassword(user.id, passwordHash);

    // Expire the code
    await this.redisService.del(redisKey);

    // Invalidate all sessions (expire refresh token)
    await this.userService.updateRefreshToken(user.id, null);

    return { message: '비밀번호가 재설정되었습니다. 새 비밀번호로 로그인해주세요.' };
  }

  // ─── Token Generation ───────────────────────────────────

  async generateTokens(
    user: { id: string; email?: string | null; role: string; memberType: string },
    keepLoggedIn?: boolean,
  ) {
    const payload = {
      sub: user.id,
      email: user.email || '',
      role: user.role,
      memberType: user.memberType,
    };

    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access' },
      {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<string>('jwt.accessExpiry', '15m'),
      },
    );

    const refreshExpiresIn = keepLoggedIn ? '30d' : this.configService.get<string>('jwt.refreshExpiry', '7d');

    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: refreshExpiresIn,
      },
    );

    // Hash refresh token before storing in DB
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateRefreshToken(user.id, refreshTokenHash);

    return {
      accessToken,
      refreshToken,
    };
  }

  // ─── Validate User (for JWT strategy) ───────────────────

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        memberType: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }

  // ─── Private Helpers ────────────────────────────────────

  private async incrementLoginFailCount(email: string) {
    const failKey = LOGIN_FAIL_PREFIX + email;
    const lockKey = LOGIN_LOCK_PREFIX + email;

    const count = await this.redisService.incr(failKey);
    await this.redisService.expire(failKey, LOCK_DURATION_SECONDS);

    if (count >= MAX_LOGIN_ATTEMPTS) {
      await this.redisService.set(lockKey, '1', LOCK_DURATION_SECONDS);
      await this.redisService.del(failKey);
    }
  }
}
