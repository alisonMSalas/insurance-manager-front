export interface Insurance {
  id?: string;
  name: string;
  type: InsuranceType | null;
  description: string;
  coverage: number;
deductible: number;
paymentAmount: number;
  paymentPeriod: PaymentPeriod | null;
  active: boolean | null;
}
export enum InsuranceType {
  LIFE = 'LIFE',
  HEALTH = 'HEALTH',
}

export enum PaymentPeriod {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}
