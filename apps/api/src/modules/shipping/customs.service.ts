import { Injectable, Logger } from '@nestjs/common';

const DUTY_FREE_THRESHOLD_USD = 150;
const DUTY_RATE = 0.08; // 8% customs duty
const VAT_RATE = 0.10; // 10% VAT

export interface CustomsDutyResult {
  totalValueUsd: number;
  isDutyFree: boolean;
  customsDuty: number;
  vat: number;
  totalDutyAndTax: number;
  dutyRate: string;
  vatRate: string;
  threshold: number;
  currency: string;
}

@Injectable()
export class CustomsService {
  private readonly logger = new Logger(CustomsService.name);

  /**
   * Calculate customs duty and VAT for imported goods
   * South Korea: duty-free if total value <= $150 USD
   * If > $150: apply 8% duty + 10% VAT on (value + duty)
   */
  calculateCustomsDuty(totalUsd: number): CustomsDutyResult {
    if (totalUsd <= 0) {
      return {
        totalValueUsd: 0,
        isDutyFree: true,
        customsDuty: 0,
        vat: 0,
        totalDutyAndTax: 0,
        dutyRate: `${DUTY_RATE * 100}%`,
        vatRate: `${VAT_RATE * 100}%`,
        threshold: DUTY_FREE_THRESHOLD_USD,
        currency: 'USD',
      };
    }

    const isDutyFree = totalUsd <= DUTY_FREE_THRESHOLD_USD;

    if (isDutyFree) {
      return {
        totalValueUsd: totalUsd,
        isDutyFree: true,
        customsDuty: 0,
        vat: 0,
        totalDutyAndTax: 0,
        dutyRate: `${DUTY_RATE * 100}%`,
        vatRate: `${VAT_RATE * 100}%`,
        threshold: DUTY_FREE_THRESHOLD_USD,
        currency: 'USD',
      };
    }

    // Customs duty: 8% of total value
    const customsDuty = Math.round(totalUsd * DUTY_RATE * 100) / 100;

    // VAT: 10% of (total value + customs duty)
    const vatBase = totalUsd + customsDuty;
    const vat = Math.round(vatBase * VAT_RATE * 100) / 100;

    const totalDutyAndTax = Math.round((customsDuty + vat) * 100) / 100;

    return {
      totalValueUsd: totalUsd,
      isDutyFree: false,
      customsDuty,
      vat,
      totalDutyAndTax,
      dutyRate: `${DUTY_RATE * 100}%`,
      vatRate: `${VAT_RATE * 100}%`,
      threshold: DUTY_FREE_THRESHOLD_USD,
      currency: 'USD',
    };
  }

  /**
   * Check if the total value is under the duty-free threshold
   */
  isDutyFree(totalUsd: number): boolean {
    return totalUsd <= DUTY_FREE_THRESHOLD_USD;
  }
}
