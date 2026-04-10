import { Injectable, Logger } from '@nestjs/common';
import {
  ShippingService,
  ShippingMethodType,
  ShippingFeeResult,
} from './shipping.service';

export interface ShippingItem {
  weightKg: number;
  length: number; // cm
  width: number; // cm
  height: number; // cm
  quantity: number;
}

export interface ShippingTotalResult {
  totalFee: number;
  totalActualWeight: number;
  totalVolumeWeight: number;
  totalChargeableWeight: number;
  method: ShippingMethodType;
  estimatedDelivery: { from: Date; to: Date };
  itemCount: number;
  currency: string;
}

@Injectable()
export class ShippingCalculatorService {
  private readonly logger = new Logger(ShippingCalculatorService.name);

  constructor(private readonly shippingService: ShippingService) {}

  /**
   * Calculate total shipping for multiple items
   */
  calculateTotal(
    items: ShippingItem[],
    method: ShippingMethodType,
  ): ShippingTotalResult {
    let totalActualWeight = 0;
    let totalVolumeCm3 = 0;
    let itemCount = 0;

    for (const item of items) {
      totalActualWeight += item.weightKg * item.quantity;
      totalVolumeCm3 +=
        item.length * item.width * item.height * item.quantity;
      itemCount += item.quantity;
    }

    // Calculate combined dimensions for fee calculation
    // Use cube root of total volume to get equivalent box dimensions
    const cbrt = Math.cbrt(totalVolumeCm3);
    const eqL = Math.ceil(cbrt);
    const eqW = Math.ceil(cbrt);
    const eqH = Math.ceil(cbrt);

    const feeResult = this.shippingService.calculateShippingFee(
      totalActualWeight,
      eqL,
      eqW,
      eqH,
      method,
    );

    const delivery = this.estimateDeliveryDate(method);

    return {
      totalFee: feeResult.fee,
      totalActualWeight,
      totalVolumeWeight: feeResult.volumeWeight,
      totalChargeableWeight: feeResult.chargeableWeight,
      method,
      estimatedDelivery: delivery,
      itemCount,
      currency: 'KRW',
    };
  }

  /**
   * Estimate delivery date range based on shipping method
   */
  estimateDeliveryDate(
    method: ShippingMethodType,
  ): { from: Date; to: Date } {
    const now = new Date();
    let minDays: number;
    let maxDays: number;

    switch (method) {
      case ShippingMethodType.AIR:
        minDays = 3;
        maxDays = 7;
        break;
      case ShippingMethodType.SEA:
        minDays = 15;
        maxDays = 25;
        break;
      default:
        minDays = 7;
        maxDays = 14;
    }

    const from = new Date(now);
    from.setDate(from.getDate() + minDays);

    const to = new Date(now);
    to.setDate(to.getDate() + maxDays);

    return { from, to };
  }
}
