import { Attachment } from "./attachment";
import { Client } from "./client";
import { ContractStep } from "./contract-step";
import { Insurance } from "./insurance";

export interface Contract {
  id?: string;
  startDate?: string;
  status?: string;
  totalPaymentAmount?: number;
  insuranceId?: string;
  clientId?: string;
  active?: boolean;
  client?: Client;
  insurance?: Insurance & {
    benefits: {
      id: string;
      name: string;
      description: string;
    }[];
  };
  beneficiaries?: {
    id?: string;
    name: string;
    lastName: string;
    identificationNumber: string;
    relationship: string;
    phoneNumber: string;
  }[];
  clientAttachments?: Attachment[];
  contractFile?: string;
  stepStatuses?: Record<ContractStep, boolean>;
}
