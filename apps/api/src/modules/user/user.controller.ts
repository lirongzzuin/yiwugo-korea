import {
  Controller,
  Get,
  Patch,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
import { UserService } from './user.service';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import {
  UpdateUserDto,
  ChangePasswordDto,
  CreateAddressDto,
  UpdateAddressDto,
  UpdateCustomsCodeDto,
} from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { BadRequestException } from '@nestjs/common';

@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: '내 프로필 조회' })
  @ApiResponse({ status: 200, description: '프로필 정보 반환' })
  async getProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.findById(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: '프로필 수정' })
  @ApiResponse({ status: 200, description: '수정된 프로필 정보 반환' })
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.update(user.sub, dto);
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiResponse({ status: 200, description: '비밀번호 변경 성공' })
  @ApiResponse({ status: 400, description: '현재 비밀번호 불일치' })
  async changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    const existingUser = await this.userService.findByEmail(user.email);
    if (!existingUser || !existingUser.passwordHash) {
      throw new BadRequestException('비밀번호를 변경할 수 없습니다. 소셜 로그인 계정입니다.');
    }

    const isValid = await bcrypt.compare(dto.oldPassword, existingUser.passwordHash);
    if (!isValid) {
      throw new BadRequestException('현재 비밀번호가 일치하지 않습니다.');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 12);
    await this.userService.updatePassword(user.sub, newHash);

    return { message: '비밀번호가 변경되었습니다.' };
  }

  // ─── Addresses ───────────────────────────────────────────

  @Get('me/addresses')
  @ApiOperation({ summary: '배송지 목록 조회' })
  @ApiResponse({ status: 200, description: '배송지 목록 반환' })
  async getAddresses(@CurrentUser() user: JwtPayload) {
    return this.userService.getAddresses(user.sub);
  }

  @Post('me/addresses')
  @ApiOperation({ summary: '배송지 추가' })
  @ApiResponse({ status: 201, description: '생성된 배송지 반환' })
  async addAddress(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateAddressDto,
  ) {
    return this.userService.addAddress(user.sub, dto);
  }

  @Patch('me/addresses/:id')
  @ApiOperation({ summary: '배송지 수정' })
  @ApiResponse({ status: 200, description: '수정된 배송지 반환' })
  async updateAddress(
    @CurrentUser() user: JwtPayload,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.userService.updateAddress(user.sub, addressId, dto);
  }

  @Delete('me/addresses/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '배송지 삭제' })
  @ApiResponse({ status: 204, description: '배송지 삭제 성공' })
  async deleteAddress(
    @CurrentUser() user: JwtPayload,
    @Param('id') addressId: string,
  ) {
    await this.userService.deleteAddress(user.sub, addressId);
  }

  // ─── Customs Code ────────────────────────────────────────

  @Put('me/customs-code')
  @ApiOperation({ summary: '개인통관고유부호 등록/수정' })
  @ApiResponse({ status: 200, description: '개인통관고유부호 업데이트 성공' })
  async updateCustomsCode(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateCustomsCodeDto,
  ) {
    await this.userService.updateCustomsCode(user.sub, dto.code);
    return { message: '개인통관고유부호가 등록되었습니다.' };
  }

  // ─── Deactivate ──────────────────────────────────────────

  @Delete('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({ status: 200, description: '회원 탈퇴 완료' })
  async deactivate(@CurrentUser() user: JwtPayload) {
    await this.userService.deactivate(user.sub);
    return { message: '회원 탈퇴가 완료되었습니다.' };
  }
}
