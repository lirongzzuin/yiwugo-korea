export const ShippingConstants = {
  /** Air shipping rate per kg in KRW */
  AIR_RATE_PER_KG: 12000,
  /** Sea shipping rate per kg in KRW */
  SEA_RATE_PER_KG: 4000,
  /** Base handling fee in KRW */
  BASE_FEE: 5000,
  /** Free shipping threshold in KRW */
  FREE_SHIPPING_THRESHOLD: 300000,
  /** Customs duty-free limit in USD (under $150 duty-free for personal use) */
  CUSTOMS_DUTY_FREE_LIMIT_USD: 150,
  /** Korean VAT rate */
  VAT_RATE: 0.1,
} as const;

export interface ShippingEstimate {
  method: 'AIR' | 'SEA';
  weightKg: number;
  baseFee: string;
  shippingFee: string;
  totalFee: string;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
}
