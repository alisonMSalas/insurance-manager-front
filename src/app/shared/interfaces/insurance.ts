import { Benefit } from "./benefit";
export interface Insurance {

  id?: string;
  name: string;
  type: InsuranceType | null;
  description: string;
  coverage: number | null;        // permitir null
  deductible: number | null;      // permitir null
  paymentAmount: number | null;
  paymentPeriod: PaymentPeriod | null;
  active: boolean | null;
  benefits?: Benefit[]; 
  
}
export enum InsuranceType {
  LIFE = 'LIFE',
  HEALTH = 'HEALTH',
}

export enum PaymentPeriod {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}
