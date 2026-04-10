import { Injectable, Logger, BadRequestException } from '@nestjs/common';

export enum ShippingMethodType {
  AIR = 'AIR',
  SEA = 'SEA',
}

// Rate constants (per kg, in KRW)
const AIR_RATE = 8500; // 8,500 KRW per kg for air freight
const SEA_RATE = 3500; // 3,500 KRW per kg for sea freight
const AIR_BASE_FEE = 15000; // base handling fee for air
const SEA_BASE_FEE = 25000; // base handling fee for sea (customs processing)

// Volume weight divisors
const AIR_VOLUME_DIVISOR = 6000; // L*W*H / 6000 for air
const SEA_VOLUME_DIVISOR = 5000; // L*W*H / 5000 for sea

export interface ShippingFeeResult {
  fee: number;
  actualWeight: number;
  volumeWeight: number;
  chargeableWeight: number;
  method: ShippingMethodType;
  estimatedDays: { min: number; max: number };
  baseFee: number;
  weightFee: number;
  currency: string;
}

@Injectable()
export class ShippingService {
  private readonly logger = new Logger(ShippingService.name);

  /**
   * Calculate shipping fee based on weight, dimensions, and method
   */
  calculateShippingFee(
    weightKg: number,
    volumeL: number,
    volumeW: number,
    volumeH: number,
    method: ShippingMethodType,
  ): ShippingFeeResult {
    if (weightKg <= 0) {
      throw new BadRequestException('무게는 0보다 커야 합니다.');
    }

    if (volumeL <= 0 || volumeW <= 0 || volumeH <= 0) {
      throw new BadRequestException('가로, 세로, 높이는 0보다 커야 합니다.');
    }

    const divisor =
      method === ShippingMethodType.AIR
        ? AIR_VOLUME_DIVISOR
        : SEA_VOLUME_DIVISOR;

    // Volume weight: L(cm) * W(cm) * H(cm) / divisor
    const volumeWeight = (volumeL * volumeW * volumeH) / divisor;

    // Chargeable weight: higher of actual weight vs volume weight
    const chargeableWeight = Math.max(weightKg, volumeWeight);

    // Round up to nearest 0.5 kg
    const roundedWeight = Math.ceil(chargeableWeight * 2) / 2;

    const rate = method === ShippingMethodType.AIR ? AIR_RATE : SEA_RATE;
    const baseFee =
      method === ShippingMethodType.AIR ? AIR_BASE_FEE : SEA_BASE_FEE;

    const weightFee = Math.round(roundedWeight * rate);
    const totalFee = weightFee + baseFee;

    const estimatedDays = this.getEstimatedDays(method);

    return {
      fee: totalFee,
      actualWeight: weightKg,
      volumeWeight: Math.round(volumeWeight * 100) / 100,
      chargeableWeight: roundedWeight,
      method,
      estimatedDays,
      baseFee,
      weightFee,
      currency: 'KRW',
    };
  }

  /**
   * Get estimated delivery days by method
   */
  private getEstimatedDays(
    method: ShippingMethodType,
  ): { min: number; max: number } {
    switch (method) {
      case ShippingMethodType.AIR:
        return { min: 3, max: 7 };
      case ShippingMethodType.SEA:
        return { min: 15, max: 25 };
      default:
        return { min: 7, max: 14 };
    }
  }
}
