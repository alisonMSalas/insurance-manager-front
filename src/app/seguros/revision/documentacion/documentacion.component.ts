import {
  Component,
  inject,
  Input,
  SimpleChanges,
  OnChanges,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { Attachment, AttachmentType } from '../../../shared/interfaces/attachment';
import { AttachmentService } from '../../../core/services/attachment.service';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { FileUpload } from 'primeng/fileupload';
import { MessageModule } from 'primeng/message';
import { Dialog } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ContratacionesService } from '../../../core/services/contrataciones.service';

@Component({
  selector: 'app-documentacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    CardModule,
    ToastModule,
    FileUploadModule,
    ProgressBarModule,
    BadgeModule,
    MessageModule,
    Dialog,
    TextareaModule
  ],
  templateUrl: './documentacion.component.html',
  styleUrls: ['./documentacion.component.css'],
  providers: [MessageService],
})
export class DocumentacionComponent implements OnChanges {
  @Input() clienteId: string = '';
  @Input() clientAttachments?: Attachment[] = [];
  @Input() contratoId: string = '';
  @Input() documentosAprobados!: boolean;
  @ViewChild('fileUpload') fileUpload!: FileUpload;

  pendingFiles: File[] = [];
  completedFiles: Array<{
    name: string;
    size: number;
    type: 'pdf' | 'image';
    date: Date;
    file: File;
    attachmentType: AttachmentType;
    objectURL?: string;
  }> = [];
  totalSize: string = '0B';
  totalSizePercent: number = 0;
  showSaveWarning: boolean = false;
documentosGuardados: boolean = false;

  docService = inject(AttachmentService);
  messageService = inject(MessageService);
  contratoService = inject(ContratacionesService);

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['clienteId'] && changes['clienteId'].currentValue) {
      if (!this.clienteId) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Client ID no proporcionado' });
      }
    }

    if (changes['clientAttachments'] && changes['clientAttachments'].currentValue) {
      const newAttachments = changes['clientAttachments'].currentValue;

      if (Array.isArray(newAttachments)) {
        this.completedFiles = newAttachments
          .filter((att: Attachment) =>
            [AttachmentType.IDENTIFICATION, AttachmentType.PORTRAIT_PHOTO].includes(att.attachmentType)
          )
          .map((att: Attachment) => {
            const file = this.base64ToFile(att.content, att.fileName, att.attachmentType);
            return {
              name: att.fileName,
              size: file.size / 1024, // Size in KB
              type: att.attachmentType === AttachmentType.IDENTIFICATION ? 'pdf' : 'image',
              date: new Date(),
              file,
              attachmentType: att.attachmentType,
              objectURL: URL.createObjectURL(file)
            };
          });
        this.updateTotalSize();
      }
    }
  }

  base64ToFile(base64: string, fileName: string, type: AttachmentType): File {
    const mimeType = this.getMimeTypeFromType(type);
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeType });
    return new File([blob], fileName, { type: mimeType });
  }

  getMimeTypeFromType(type: AttachmentType): string {
    switch (type) {
      case AttachmentType.IDENTIFICATION:
        return 'application/pdf';
      case AttachmentType.PORTRAIT_PHOTO:
        return 'image/jpeg';
      default:
        return 'application/octet-stream';
    }
  }

  onSelectedFiles(event: any) {
    const selectedFiles: File[] = event.files;

    if (this.completedFiles.length + selectedFiles.length > 2) {
      this.messageService.add({
        severity: 'error',
        summary: 'Límite excedido',
        detail: 'Solo se permiten hasta dos archivos (Identificación y Foto).'
      });
      this.fileUpload.clear();
      this.pendingFiles = [];
      this.updateTotalSize();
      return;
    }

    for (const file of selectedFiles) {
      if (this.validateFile(file)) {
        const attachmentType = file.type.includes('pdf')
          ? AttachmentType.IDENTIFICATION
          : AttachmentType.PORTRAIT_PHOTO;

        if (this.completedFiles.some(doc => doc.attachmentType === attachmentType)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Archivo duplicado',
            detail: `Ya se ha cargado un archivo de tipo ${attachmentType === AttachmentType.IDENTIFICATION ? 'Identificación' : 'Foto'}.`
          });
        } else {
          this.completedFiles.push({
            name: file.name,
            size: file.size / 1024, // Size in KB
            type: file.type.includes('pdf') ? 'pdf' : 'image',
            date: new Date(),
            file,
            attachmentType,
            objectURL: URL.createObjectURL(file)
          });
          this.showSaveWarning = true; // Show warning on new file
        }
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Archivo no válido',
          detail: `El archivo ${file.name} no es válido o excede los 5MB.`
        });
      }
    }

    this.fileUpload.clear(); // Clear file upload after processing
    this.pendingFiles = [];
    this.updateTotalSize();
  }

  onFileRemoved(event: any): void {
    this.pendingFiles = this.fileUpload.files;
    this.updateTotalSize();
  }

  removeCompletedFile(index: number): void {
    const removedFile = this.completedFiles.splice(index, 1)[0];
    if (removedFile.objectURL) {
      URL.revokeObjectURL(removedFile.objectURL);
    }
    this.fileUpload.clear();
    this.updateTotalSize();
  }

  updateTotalSize(): void {
    const totalBytes = this.completedFiles.reduce((sum, doc) => sum + (doc.size * 1024), 0); // Convert KB back to bytes
    this.totalSize = this.formatSize(totalBytes);
    this.totalSizePercent = Math.min((totalBytes / (5 * 1024 * 1024)) * 100, 100);
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFilePreviewUrl(doc: any): string {
    return doc.objectURL || URL.createObjectURL(doc.file);
  }

  verDocumento(doc: any): void {
    const fileURL = doc.objectURL || URL.createObjectURL(doc.file);
    window.open(fileURL, '_blank');
  }

  guardar(): void {

    if (!this.completedFiles.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay documentos para guardar',
      });
      return;
    }

    const documentos: Promise<Attachment>[] = this.completedFiles.map((doc) => {
      return new Promise<Attachment>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Content = (reader.result as string).split(',')[1];
          resolve({
            content: base64Content,
            fileName: doc.name,
            attachmentType: doc.attachmentType
          });
        };
        reader.readAsDataURL(doc.file);
      });
    });

    Promise.all(documentos).then((docs) => {
      this.docService.uploadDocument(this.clienteId, docs).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Se han guardado los documentos',
          });
          this.showSaveWarning = false;
           this.documentosGuardados = true;
          this.updateTotalSize();
        },
        error: (err) => {
          console.error('Error al guardar documentos:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al guardar los documentos',
          });
        }
      });
    });
  }

  getFileType(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('image')) return 'Imagen';
    return 'Desconocido';
  }

  validateFile(file: File): boolean {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSizeMB = 5;
    const isValid = validTypes.includes(file.type) && file.size <= maxSizeMB * 1024 * 1024;
    return isValid;
  }

  choose(event: Event, chooseCallback: any) {
    chooseCallback();
  }


  modalRechazoVisible: boolean = false;
  observacionRechazo: string = '';

  mostrarModalRechazo() {
    this.modalRechazoVisible = true;
  }

  async rechazarDocumentos() {
    this.formSubmitted = true;

    if (!this.observacionRechazo) {
      return;
    }

    this.procesando = true;
    try {
      await // tu lógica de rechazo aquí
        this.cerrarModal();
    } finally {
      this.procesando = false;
    }
  }
  procesando: boolean = false;
  formSubmitted: boolean = false;

  cerrarModal() {
    this.modalRechazoVisible = false;
    this.formSubmitted = false;
    this.observacionRechazo = '';

  }

  aprobarDocumentos() {
    this.contratoService.aprobarDocumentos(this.contratoId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Documentos aprobados' });
        this.documentosAprobados = true;
      },
      error: (err) => {
        console.error('Error al aprobar documentos:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al aprobar documentos' });
      }
    });
  }
} 