import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto, UpdateUserDto } from './dto/update-user.dto';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly encryptionKey: Buffer;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const secret = this.configService.get<string>(
      'app.encryptionSecret',
      'yiwugo-encryption-secret-change-me',
    );
    this.encryptionKey = scryptSync(secret, 'salt', 32);
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        provider: true,
        memberType: true,
        businessNumber: true,
        businessName: true,
        role: true,
        customsCode: true,
        points: true,
        isEmailVerified: true,
        isActive: true,
        lastLoginAt: true,
        marketingConsent: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // Decrypt customs code if present
    if (user.customsCode) {
      try {
        user.customsCode = this.decrypt(user.customsCode);
      } catch {
        // If decryption fails, it might be stored in plain text (legacy)
      }
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByProvider(provider: string, providerId: string) {
    return this.prisma.user.findFirst({
      where: {
        provider: provider as any,
        providerId,
      },
    });
  }

  async create(data: {
    email?: string;
    passwordHash?: string;
    name?: string;
    phone?: string;
    provider?: string;
    providerId?: string;
    memberType?: string;
    businessNumber?: string;
    businessName?: string;
    marketingConsent?: boolean;
    isEmailVerified?: boolean;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name,
        phone: data.phone,
        provider: data.provider as any,
        providerId: data.providerId,
        memberType: (data.memberType as any) || 'INDIVIDUAL',
        businessNumber: data.businessNumber,
        businessName: data.businessName,
        marketingConsent: data.marketingConsent ?? false,
        isEmailVerified: data.isEmailVerified ?? false,
      },
    });
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // Check phone uniqueness if updating phone
    if (data.phone && data.phone !== user.phone) {
      const existing = await this.prisma.user.findUnique({
        where: { phone: data.phone },
      });
      if (existing) {
        throw new ConflictException('이미 사용 중인 휴대폰 번호입니다.');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        memberType: true,
        businessNumber: true,
        businessName: true,
        role: true,
        points: true,
        marketingConsent: true,
        updatedAt: true,
      },
    });
  }

  async updatePassword(id: string, newPasswordHash: string) {
    return this.prisma.user.update({
      where: { id },
      data: { passwordHash: newPasswordHash },
    });
  }

  async updateRefreshToken(id: string, refreshToken: string | null) {
    return this.prisma.user.update({
      where: { id },
      data: { refreshToken },
    });
  }

  async updateLastLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  // ─── Addresses ───────────────────────────────────────────

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async addAddress(userId: string, data: CreateAddressDto) {
    // If setting as default, unset other defaults
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // If this is the first address, make it default
    const addressCount = await this.prisma.address.count({ where: { userId } });
    const isDefault = data.isDefault ?? addressCount === 0;

    return this.prisma.address.create({
      data: {
        userId,
        label: data.label,
        name: data.name,
        phone: data.phone,
        zipCode: data.zipCode,
        address1: data.address1,
        address2: data.address2,
        isDefault,
      },
    });
  }

  async updateAddress(userId: string, addressId: string, data: UpdateAddressDto) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('배송지를 찾을 수 없습니다.');
    }

    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('배송지를 찾을 수 없습니다.');
    }

    await this.prisma.address.delete({ where: { id: addressId } });

    // If deleted address was default, set the most recent one as default
    if (address.isDefault) {
      const remaining = await this.prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      if (remaining) {
        await this.prisma.address.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }
  }

  // ─── Customs Code ────────────────────────────────────────

  async updateCustomsCode(userId: string, code: string) {
    const encrypted = this.encrypt(code);
    return this.prisma.user.update({
      where: { id: userId },
      data: { customsCode: encrypted },
      select: { id: true, customsCode: true },
    });
  }

  // ─── Deactivate ──────────────────────────────────────────

  async deactivate(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        refreshToken: null,
        email: null,
        phone: null,
        name: '탈퇴한 사용자',
      },
    });
  }

  // ─── Encryption Helpers ──────────────────────────────────

  private encrypt(text: string): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedText: string): string {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv('aes-256-cbc', this.encryptionKey, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
