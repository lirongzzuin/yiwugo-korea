import {
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

export class UpdateUserDto {
  @ApiPropertyOptional({ example: '홍길동' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ example: '01012345678' })
  @IsOptional()
  @IsString()
  @Matches(/^01[016789]\d{7,8}$/, { message: '유효한 휴대폰 번호를 입력해주세요.' })
  phone?: string;

  @ApiPropertyOptional({ example: '1234567890' })
  @IsOptional()
  @IsString()
  businessNumber?: string;

  @ApiPropertyOptional({ example: '(주)홍길동상사' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;
}

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldP@ssw0rd!' })
  @IsString()
  @IsNotEmpty({ message: '현재 비밀번호를 입력해주세요.' })
  oldPassword!: string;

  @ApiProperty({ example: 'NewP@ssw0rd!' })
  @IsString()
  @MinLength(8, { message: '비밀번호는 8자 이상이어야 합니다.' })
  @MaxLength(100)
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?])/, {
    message: '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.',
  })
  newPassword!: string;
}

export class CreateAddressDto {
  @ApiPropertyOptional({ example: '집' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  label?: string;

  @ApiProperty({ example: '홍길동' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @ApiProperty({ example: '01012345678' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^01[016789]\d{7,8}$/, { message: '유효한 휴대폰 번호를 입력해주세요.' })
  phone!: string;

  @ApiProperty({ example: '06234' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}$/, { message: '유효한 우편번호를 입력해주세요.' })
  zipCode!: string;

  @ApiProperty({ example: '서울특별시 강남구 테헤란로 123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  address1!: string;

  @ApiPropertyOptional({ example: '4층 401호' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address2?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateAddressDto {
  @ApiPropertyOptional({ example: '회사' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  label?: string;

  @ApiPropertyOptional({ example: '홍길동' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ example: '01012345678' })
  @IsOptional()
  @IsString()
  @Matches(/^01[016789]\d{7,8}$/, { message: '유효한 휴대폰 번호를 입력해주세요.' })
  phone?: string;

  @ApiPropertyOptional({ example: '06234' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{5}$/, { message: '유효한 우편번호를 입력해주세요.' })
  zipCode?: string;

  @ApiPropertyOptional({ example: '서울특별시 강남구 테헤란로 123' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address1?: string;

  @ApiPropertyOptional({ example: '4층 401호' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  address2?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdateCustomsCodeDto {
  @ApiProperty({ example: 'P123456789012', description: '개인통관고유부호 (P + 12자리)' })
  @IsString()
  @IsNotEmpty({ message: '개인통관고유부호를 입력해주세요.' })
  @Matches(/^P\d{12}$/, { message: '개인통관고유부호 형식이 올바르지 않습니다. (P + 12자리 숫자)' })
  code!: string;
}
