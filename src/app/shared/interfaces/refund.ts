import { Attachment } from "./attachment";

export interface Refund {
  id?: string;
  refundType: string;
  date: string;
  description: string;
  observation: string;
  paidAmount: number;
  coveredAmount: number;
  status: RefundStatus;
  attachments: Attachment[];
  contractId: string;

}


export type RefundStatus = 'NEW' | 'APPROVED' | 'REJECTED';