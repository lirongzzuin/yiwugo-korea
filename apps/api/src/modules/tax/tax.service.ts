import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class TaxService {
  private readonly logger = new Logger(TaxService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Issue a cash receipt for an order.
   * In production this would call the tax API (e.g. NTS/PG provider).
   * Currently a stub that marks the payment's cashReceiptIssued flag.
   */
  async issueCashReceipt(
    userId: string,
    orderId: string,
    identityNumber: string,
    type: 'income' | 'expense',
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('본인의 주문만 현금영수증 발급이 가능합니다.');
    }

    if (!order.payment) {
      throw new BadRequestException('결제 정보가 없습니다.');
    }

    if (order.payment.cashReceiptIssued) {
      throw new BadRequestException('이미 현금영수증이 발급되었습니다.');
    }

    if (order.payment.status !== 'APPROVED') {
      throw new BadRequestException('승인된 결제만 현금영수증 발급이 가능합니다.');
    }

    this.logger.log(
      `Cash receipt issued: orderId=${orderId}, type=${type}, identity=${identityNumber.slice(0, 3)}***`,
    );

    // TODO: Call actual tax API (NTS / PG provider) here

    await this.prisma.payment.update({
      where: { id: order.payment.id },
      data: { cashReceiptIssued: true },
    });

    return {
      success: true,
      orderId,
      type,
      message: '현금영수증이 발급되었습니다.',
    };
  }

  /**
   * Issue an e-tax invoice for a business member.
   * In production this would call the NTS e-tax invoice API.
   * Currently a stub that validates the user is a business member.
   */
  async issueInvoice(userId: string, orderId: string, businessNumber: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (user.memberType !== 'BUSINESS') {
      throw new ForbiddenException(
        '사업자 회원만 세금계산서 발급이 가능합니다.',
      );
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('본인의 주문만 세금계산서 발급이 가능합니다.');
    }

    if (!order.payment || order.payment.status !== 'APPROVED') {
      throw new BadRequestException('승인된 결제만 세금계산서 발급이 가능합니다.');
    }

    this.logger.log(
      `E-tax invoice issued: orderId=${orderId}, businessNumber=${businessNumber}`,
    );

    // TODO: Call actual NTS e-tax invoice API here

    return {
      success: true,
      orderId,
      businessNumber,
      message: '세금계산서 발급이 요청되었습니다.',
    };
  }
}
