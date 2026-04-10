export enum SettlementStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  PAID_TO_YIWUGO = 'PAID_TO_YIWUGO',
}

export interface Settlement {
  id: string;
  status: SettlementStatus;
  periodStart: string;
  periodEnd: string;
  orderIds: string[];
  totalOrderAmountKrw: string;
  totalOrderAmountCny: string;
  totalCommissionKrw: string;
  totalShippingCny: string;
  exchangeRateUsed: string;
  settlementAmountCny: string;
  remittanceRef?: string;
  confirmedAt?: string;
  paidAt?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}
