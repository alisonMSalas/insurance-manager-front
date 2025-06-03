import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';

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
  ],
  templateUrl: './documentacion.component.html',
  styleUrls: ['./documentacion.component.css'],
  providers: [MessageService],
})
export class DocumentacionComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  activeTab: 'upload' | 'view' = 'upload';
  archivoSeleccionado: File | null = null;
  uploadProgress: number = 0;
  isDragging: boolean = false;

  documentosCargados: Array<{
    name: string;
    size: number;
    type: 'pdf' | 'image';
    date: Date;
    file: File;
  }> = [];

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
    alert('Documento guardado (simulado).');
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
