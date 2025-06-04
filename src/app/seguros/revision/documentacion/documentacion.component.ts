import {
  Component,
  ViewChild,
  ElementRef,
  inject,
  Input,
  SimpleChanges,
  OnChanges
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
import { Toast } from 'primeng/toast';

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
    Toast,
    FileUploadModule
  ],
  templateUrl: './documentacion.component.html',
  styleUrls: ['./documentacion.component.css'],
  providers: [MessageService],
})
export class DocumentacionComponent implements OnChanges {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Input() clienteId: string = '';
  @Input() clientAttachments?: Attachment[] = [];

  activeTab: 'upload' | 'view' = 'upload';
  archivoSeleccionado: File | null = null;
  uploadProgress: number = 0;
  isDragging: boolean = false;

  docService = inject(AttachmentService);
  messageService = inject(MessageService);

  documentosCargados: Array<{
    name: string;
    size: number;
    type: 'pdf' | 'image';
    date: Date;
    file: File;
  }> = [];

  ngOnInit() {
    console.log('Client ID en DocumentacionComponent (ngOnInit):', this.clienteId);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['clienteId'] && changes['clienteId'].currentValue) {
      console.log('Client ID actualizado en DocumentacionComponent:', this.clienteId);

      if (!this.clienteId) {
        console.error('Client ID no proporcionado');
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Client ID no proporcionado' });
      }

      if (changes['clientAttachments']) {
        const newAttachments = changes['clientAttachments'].currentValue;
        console.log('>> Attachments actualizados desde el padre:', newAttachments);

        if (Array.isArray(newAttachments)) {
          this.documentosCargados = newAttachments.map((att) => {
            const file = this.base64ToFile(att.content, att.fileName, att.attachmentType);
            return {
              name: att.fileName,
              size: +(file.size / 1024).toFixed(2),
              type: att.attachmentType === 'IDENTIFICATION' ? 'pdf' : 'image',
              date: new Date(),
              file: file,
            };
          });
        }
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
      case AttachmentType.PAYMENT_PROOF:
        return 'image/jpeg';
      default:
        return 'application/octet-stream';
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (this.validarArchivo(file)) {
        this.archivoSeleccionado = file;
        this.simularCarga(file);
      } else {
        alert('Archivo no válido o excede los 5MB.');
        this.limpiarInput();
      }
    }
  }

  simularCarga(file: File) {
    this.uploadProgress = 0;
    const interval = setInterval(() => {
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
        this.documentosCargados.push({
          name: file.name,
          size: +(file.size / 1024).toFixed(2),
          type: file.type.includes('pdf') ? 'pdf' : 'image',
          date: new Date(),
          file,
        });
        this.archivoSeleccionado = null;
        this.limpiarInput();
        this.uploadProgress = 0;
      } else {
        this.uploadProgress += 10;
      }
    }, 100);
  }

  eliminarArchivo() {
    this.archivoSeleccionado = null;
    this.limpiarInput();
    this.uploadProgress = 0;
  }

  limpiarInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  eliminarDocumento(doc: any) {
    this.documentosCargados = this.documentosCargados.filter((d) => d !== doc);
  }

  verDocumento(doc: any) {
    const fileURL = URL.createObjectURL(doc.file);
    window.open(fileURL, '_blank');
  }

  descargarDocumento(doc: any) {
    const a = document.createElement('a');
    const fileURL = URL.createObjectURL(doc.file);
    a.href = fileURL;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(fileURL);
  }

  guardar() {
    console.log('Guardar fue clickeado');
    console.log('Documentos cargados:', this.documentosCargados);
    console.log('Client ID:', this.clienteId);

    if (!this.documentosCargados.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay documentos para guardar',
      });
      return;
    }

    const documentos: Promise<Attachment>[] = this.documentosCargados.map((doc) => {
      return new Promise<Attachment>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Content = (reader.result as string).split(',')[1];

          let attachmentType: AttachmentType;
          if (doc.file.type.startsWith('image/')) {
            attachmentType = AttachmentType.PORTRAIT_PHOTO;
          } else if (doc.file.type === 'application/pdf') {
            attachmentType = AttachmentType.IDENTIFICATION;
          } else {
            attachmentType = AttachmentType.IDENTIFICATION;
          }

          resolve({
            content: base64Content,
            fileName: doc.name,
            attachmentType,
          });
        };
        reader.readAsDataURL(doc.file);
      });
    });

    Promise.all(documentos).then((docs) => {
      this.docService.uploadDocument(this.clienteId, docs).subscribe({
        next: () => {
          console.log('Documentos guardados exitosamente', docs);
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Se han guardado los documentos',
          });
          this.documentosCargados = [];
        },
        error: (err) => {
          console.error('Error al guardar documentos:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al guardar los documentos',
          });
        },
      });
    });
  }

  getFileType(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('image')) return 'Imagen';
    return 'Desconocido';
  }

  validarArchivo(file: File): boolean {
    const tiposValidos = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSizeMB = 5;
    return tiposValidos.includes(file.type) && file.size <= maxSizeMB * 1024 * 1024;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      if (this.validarArchivo(file)) {
        this.archivoSeleccionado = file;
        this.simularCarga(file);
      } else {
        alert('Archivo no válido o excede los 5MB.');
      }
    }
  }


  
}
