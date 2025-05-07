export interface Insurance {
  id?: string;
  name: string;
  type: InsuranceType;
  description: string;
  coverage: number;
  deductible: number;
  paymentAmount: number;
  paymentPeriod: PaymentPeriod;
  active?: boolean;
}

export enum InsuranceType {
  LIFE = 'LIFE',
  HEALTH = 'HEALTH',
}

export enum PaymentPeriod {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}
