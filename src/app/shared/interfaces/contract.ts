export interface Contract {
  id?: string;
  startDate?: string;
  status?: string;
  amountPaid?: number;
 
  insuranceId?: string;
  clientId?: string;
  isActive?: boolean;
  client?: { name: string; lastName: string };
  insurance?: { name: string };
  beneficiaries?: {
    name: string;
    lastName: string;
    identificationNumber: string;
    phoneNumber: string;
  }[];
}
