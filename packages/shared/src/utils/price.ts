import Decimal from 'decimal.js';
import { ShippingConstants } from '../constants/shipping';

/**
 * Convert CNY amount to KRW with optional commission
 * @param cny - price in CNY
 * @param exchangeRate - CNY to KRW exchange rate
 * @param commissionRate - commission rate as decimal (e.g., 0.08 for 8%)
 * @returns KRW amount as string
 */
export function cnyToKrw(
  cny: string | number,
  exchangeRate: string | number,
  commissionRate: string | number = 0,
): string {
  const cnyDec = new Decimal(cny);
  const rate = new Decimal(exchangeRate);
  const commission = new Decimal(commissionRate);
  const baseKrw = cnyDec.mul(rate);
  const total = baseKrw.mul(new Decimal(1).plus(commission));
  return total.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toString();
}

/**
 * Format amount as Korean Won display string
 * @returns e.g., "₩12,345"
 */
export function formatKrw(amount: string | number): string {
  const dec = new Decimal(amount);
  const rounded = dec.toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
  const formatted = rounded.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `₩${formatted}`;
}

/**
 * Format amount as Chinese Yuan display string
 * @returns e.g., "¥123.45"
 */
export function formatCny(amount: string | number): string {
  const dec = new Decimal(amount);
  const formatted = dec.toDecimalPlaces(2).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `¥${formatted}`;
}

/**
 * Format combined KRW and CNY price display
 * @returns e.g., "₩12,345 (¥123.45)"
 */
export function formatPriceDisplay(krw: string | number, cny: string | number): string {
  return `${formatKrw(krw)} (${formatCny(cny)})`;
}

/**
 * Calculate commission amount from total KRW
 */
export function calculateCommission(totalKrw: string | number, rate: string | number): string {
  const total = new Decimal(totalKrw);
  const commissionRate = new Decimal(rate);
  return total.mul(commissionRate).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toString();
}

/**
 * Calculate shipping fee based on weight and method
 */
export function calculateShippingFee(weightKg: number, method: 'AIR' | 'SEA'): string {
  const weight = new Decimal(weightKg);
  const ratePerKg =
    method === 'AIR'
      ? ShippingConstants.AIR_RATE_PER_KG
      : ShippingConstants.SEA_RATE_PER_KG;
  const shippingFee = weight.mul(ratePerKg);
  const total = shippingFee.plus(ShippingConstants.BASE_FEE);
  return total.toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toString();
}
