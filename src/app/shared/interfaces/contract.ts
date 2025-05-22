export interface Contract {
  id?: string;
  startDate?: string;
  status?: string;
  amountPaid?: number;
  beneficiary?: string;
  insuranceId?: string;
  clientId?: string;
  isActive?: boolean;
  client?: { name: string, lastName: string };
  insurance?: { name: string };
}