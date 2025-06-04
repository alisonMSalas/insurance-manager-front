import { Attachment } from "./attachment";
import { Client } from "./client";
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
    phoneNumber: string;
  }[];
  clientAttachments?: Attachment[];
}
