import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ExchangeRateService } from './exchange-rate.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Exchange Rate')
@Controller('exchange-rate')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current CNY→KRW exchange rate' })
  async getCurrentRate() {
    const result = await this.exchangeRateService.getCurrentRate();
    return {
      success: true,
      data: {
        rate: result.rate,
        source: result.source,
        updatedAt: result.updatedAt.toISOString(),
        isManualOverride: result.isManualOverride,
      },
    };
  }

  @Get('history')
  @ApiOperation({ summary: 'Get exchange rate history' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async getHistoryRates(@Query('days') daysStr?: string) {
    const days = daysStr ? parseInt(daysStr, 10) : 30;
    if (isNaN(days) || days < 1 || days > 365) {
      throw new BadRequestException('days must be between 1 and 365');
    }

    const history = await this.exchangeRateService.getHistoryRates(days);
    return {
      success: true,
      data: {
        days,
        records: history,
      },
    };
  }

  @Post('manual')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set manual exchange rate override (admin only)' })
  async setManualRate(
    @Body() body: { rate: number },
    @CurrentUser() user: { id: string },
  ) {
    if (!body.rate || typeof body.rate !== 'number' || body.rate <= 0) {
      throw new BadRequestException('rate must be a positive number');
    }

    if (body.rate < 100 || body.rate > 500) {
      throw new BadRequestException(
        'CNY/KRW rate must be between 100 and 500 (sanity check)',
      );
    }

    await this.exchangeRateService.setManualRate(body.rate, user.id);

    return {
      success: true,
      message: `환율이 ${body.rate}원으로 수동 설정되었습니다.`,
    };
  }

  @Post('manual/clear')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Clear manual exchange rate override (admin only)' })
  async clearManualRate() {
    await this.exchangeRateService.clearManualRate();
    return {
      success: true,
      message: '수동 환율 설정이 해제되었습니다. 자동 환율로 전환됩니다.',
    };
  }
}
