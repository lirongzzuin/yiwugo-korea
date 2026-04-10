import { IsEmail, IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: '유효한 이메일 주소를 입력해주세요.' })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'P@ssw0rd!' })
  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  password!: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  keepLoggedIn?: boolean;
}
