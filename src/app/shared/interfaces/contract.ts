export interface Contract {
  id?: string; // UUID as string in TypeScript
  startDate?: string; // LocalDate as ISO string
  status?: string;
  amountPaid?: number; 
  beneficiary?: string;
  insuranceId?: string; // UUID as string
  clientId?: string; // UUID as string
  isActive?: boolean;
}