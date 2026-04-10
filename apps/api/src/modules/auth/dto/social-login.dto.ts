import { IsString, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum SocialProvider {
  KAKAO = 'KAKAO',
  NAVER = 'NAVER',
  APPLE = 'APPLE',
}

export class SocialLoginDto {
  @ApiProperty({ enum: SocialProvider, example: SocialProvider.KAKAO })
  @IsEnum(SocialProvider, { message: '지원하는 소셜 로그인: KAKAO, NAVER, APPLE' })
  provider!: SocialProvider;

  @ApiProperty({ example: 'authorization_code_from_oauth' })
  @IsString()
  @IsNotEmpty({ message: '인가 코드를 입력해주세요.' })
  code!: string;

  @ApiProperty({ example: 'https://yiwugo.co.kr/auth/callback' })
  @IsString()
  @IsNotEmpty()
  redirectUri!: string;
}
