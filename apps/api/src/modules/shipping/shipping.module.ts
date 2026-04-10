import { Module } from '@nestjs/common';
import { ShippingService } from './shipping.service';
import { ShippingCalculatorService } from './shipping-calculator.service';
import { CustomsService } from './customs.service';
import { TrackingService } from './tracking.service';
import { ShippingController } from './shipping.controller';

@Module({
  controllers: [ShippingController],
  providers: [
    ShippingService,
    ShippingCalculatorService,
    CustomsService,
    TrackingService,
  ],
  exports: [
    ShippingService,
    ShippingCalculatorService,
    CustomsService,
    TrackingService,
  ],
})
export class ShippingModule {}
