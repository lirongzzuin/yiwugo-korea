import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: '이메일 회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공, 토큰 반환' })
  @ApiResponse({ status: 409, description: '이미 가입된 이메일' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setRefreshTokenCookie(res, result.refreshToken);

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 로그인' })
  @ApiResponse({ status: 200, description: '로그인 성공, 토큰 반환' })
  @ApiResponse({ status: 401, description: '이메일 또는 비밀번호 불일치' })
  @ApiResponse({ status: 403, description: '계정 잠금' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setRefreshTokenCookie(res, result.refreshToken, dto.keepLoggedIn);

    return {
      user: result.user,
      accessToken: result.accessToken,
    };
  }

  @Public()
  @Post('social')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '소셜 로그인 (카카오/네이버/애플)' })
  @ApiResponse({ status: 200, description: '소셜 로그인 성공' })
  @ApiResponse({ status: 401, description: '소셜 인증 실패' })
  async socialLogin(
    @Body() dto: SocialLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.socialLogin(dto);
    this.setRefreshTokenCookie(res, result.refreshToken);

    return {
      user: result.user,
      accessToken: result.accessToken,
      isNewUser: result.isNewUser,
    };
  }

  @Public()
  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiResponse({ status: 200, description: '새 토큰 발급' })
  @ApiResponse({ status: 401, description: '리프레시 토큰 만료 또는 무효' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as JwtPayload & { refreshToken: string };
    const tokens = await this.authService.refreshToken(user.sub, user.refreshToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '로그아웃' })
  @ApiResponse({ status: 200, description: '로그아웃 성공' })
  async logout(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.sub);
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });

    return { message: '로그아웃 되었습니다.' };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '비밀번호 재설정 코드 발송' })
  @ApiResponse({ status: 200, description: '코드 발송 완료' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '비밀번호 재설정' })
  @ApiResponse({ status: 200, description: '비밀번호 변경 완료' })
  @ApiResponse({ status: 400, description: '코드 불일치 또는 만료' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
  }

  @Get('me')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '현재 로그인 사용자 정보' })
  @ApiResponse({ status: 200, description: '사용자 프로필 반환' })
  async me(@CurrentUser() user: JwtPayload) {
    return this.authService.validateUser(user.sub);
  }

  @Public()
  @Get('check-email')
  @ApiOperation({ summary: '이메일 중복 확인' })
  async checkEmail(@Req() req: Request) {
    const email = (req as any).query?.email || new URL(req.url || '', 'http://localhost').searchParams.get('email');
    return this.authService.checkEmailExists(email || '');
  }

  @Public()
  @Post('send-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 인증 코드 발송' })
  async sendVerification(@Body() body: { email: string }) {
    return this.authService.sendVerificationEmail(body.email);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '이메일 인증 코드 확인' })
  async verifyEmail(@Body() body: { email: string; code: string }) {
    return this.authService.verifyEmail(body.email, body.code);
  }

  // ─── Private Helpers ────────────────────────────────────

  private setRefreshTokenCookie(
    res: Response,
    refreshToken: string,
    keepLoggedIn?: boolean,
  ) {
    const maxAge = keepLoggedIn
      ? 30 * 24 * 60 * 60 * 1000 // 30 days
      : 7 * 24 * 60 * 60 * 1000; // 7 days

    const nodeEnv = this.configService.get<string>('app.nodeEnv', 'development');

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: nodeEnv === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge,
    });
  }
}
