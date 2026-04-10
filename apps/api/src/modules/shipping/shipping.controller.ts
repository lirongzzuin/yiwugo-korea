import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { ShippingService, ShippingMethodType } from './shipping.service';
import { ShippingCalculatorService } from './shipping-calculator.service';
import { CustomsService } from './customs.service';
import { TrackingService } from './tracking.service';

@ApiTags('Shipping')
@Controller('shipping')
@UseInterceptors(TransformInterceptor)
export class ShippingController {
  constructor(
    private readonly shippingService: ShippingService,
    private readonly calculatorService: ShippingCalculatorService,
    private readonly customsService: CustomsService,
    private readonly trackingService: TrackingService,
  ) {}

  @Public()
  @Post('calculate')
  @ApiOperation({ summary: '배송비 계산' })
  async calculateShippingFee(
    @Body()
    body: {
      weightKg: number;
      length: number;
      width: number;
      height: number;
      method: string;
    },
  ) {
    const method = this.parseMethod(body.method);
    return this.shippingService.calculateShippingFee(
      body.weightKg,
      body.length,
      body.width,
      body.height,
      method,
    );
  }

  @Public()
  @Get('estimate')
  @ApiOperation({ summary: '예상 배송일 조회' })
  @ApiQuery({ name: 'method', required: false, enum: ['AIR', 'SEA'] })
  async estimateDelivery(@Query('method') method?: string) {
    const shippingMethod = this.parseMethod(method || 'AIR');
    const estimate =
      this.calculatorService.estimateDeliveryDate(shippingMethod);
    return {
      method: shippingMethod,
      from: estimate.from.toISOString(),
      to: estimate.to.toISOString(),
    };
  }

  @Public()
  @Post('customs-duty')
  @ApiOperation({ summary: '관세/부가세 계산' })
  async calculateCustomsDuty(
    @Body() body: { totalValueUsd: number },
  ) {
    if (body.totalValueUsd === undefined || body.totalValueUsd < 0) {
      throw new BadRequestException('총 물품 가치(USD)를 입력해주세요.');
    }
    return this.customsService.calculateCustomsDuty(body.totalValueUsd);
  }

  @Public()
  @Get('tracking')
  @ApiOperation({ summary: '배송 추적 조회' })
  @ApiQuery({ name: 'trackingNumber', required: true })
  async getTracking(@Query('trackingNumber') trackingNumber: string) {
    return this.trackingService.getTrackingInfo(trackingNumber);
  }

  private parseMethod(method: string): ShippingMethodType {
    const upper = method?.toUpperCase();
    if (upper === 'AIR') return ShippingMethodType.AIR;
    if (upper === 'SEA') return ShippingMethodType.SEA;
    throw new BadRequestException(
      '배송 방법은 AIR 또는 SEA만 가능합니다.',
    );
  }
}
