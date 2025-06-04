export interface Attachment {
    id?: string; // opcional porque se genera en backend
  content: string; // Base64 del archivo
  attachmentType: AttachmentType; // Enum definido en backend
  fileName: string;
}

export enum AttachmentType {
  IDENTIFICATION = 'IDENTIFICATION',
  PORTRAIT_PHOTO = 'PORTRAIT_PHOTO',
  PAYMENT_PROOF = 'PAYMENT_PROOF'
}
