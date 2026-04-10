import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  MinLength,
  MaxLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MemberType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'P@ssw0rd!' })
  @IsString()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  @MaxLength(100)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])/, {
    message: '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.',
  })
  password!: string;

  @ApiProperty({ example: '홍길동' })
  @IsString()
  @IsNotEmpty({ message: '이름을 입력해주세요.' })
  @MaxLength(50)
  name!: string;

  @ApiProperty({ example: '01012345678' })
  @IsString()
  @Matches(/^01[016789]\d{7,8}$/, { message: '유효한 휴대폰 번호를 입력해주세요.' })
  phone!: string;

  @ApiProperty({ enum: MemberType, example: MemberType.INDIVIDUAL })
  @IsEnum(MemberType, { message: '회원 유형은 INDIVIDUAL 또는 BUSINESS 입니다.' })
  memberType!: MemberType;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  businessNumber?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  agreeTerms!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  agreePrivacy!: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;
}
