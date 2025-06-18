import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DocumentacionComponent } from './documentacion.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { BadgeModule } from 'primeng/badge';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { AttachmentService } from '../../../core/services/attachment.service';
import { ContratacionesService } from '../../../core/services/contrataciones.service';
import { Attachment, AttachmentType } from '../../../shared/interfaces/attachment';
import { of, throwError } from 'rxjs';
import { FileUpload } from 'primeng/fileupload';
import { SimpleChange, SimpleChanges } from '@angular/core';


describe('DocumentacionComponent', () => {
  let component: DocumentacionComponent;
  let fixture: ComponentFixture<DocumentacionComponent>;
  let attachmentServiceSpy: jasmine.SpyObj<AttachmentService>;
  let contratacionesServiceSpy: jasmine.SpyObj<ContratacionesService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  const mockAttachment: Attachment = {
    content: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
    fileName: 'test.jpg',
    attachmentType: AttachmentType.PORTRAIT_PHOTO,
  };

  const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });

  beforeEach(async () => {
    attachmentServiceSpy = jasmine.createSpyObj('AttachmentService', ['uploadDocument']);
    contratacionesServiceSpy = jasmine.createSpyObj('ContratacionesService', ['aprobarDocumentos']);
    messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
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
        TextareaModule,
      ],
      providers: [
        { provide: AttachmentService, useValue: attachmentServiceSpy },
        { provide: ContratacionesService, useValue: contratacionesServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
      ],
      declarations: [DocumentacionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should show error message if clienteId is not provided', () => {
      const changes: SimpleChanges = {
        clienteId: new SimpleChange('123', '', false),
      };
      component.ngOnChanges(changes);
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Client ID no proporcionado',
      });
    });

    it('should process clientAttachments and update completedFiles', () => {
      const changes: SimpleChanges = {
        clientAttachments: new SimpleChange([], [mockAttachment], false),
      };
      component.ngOnChanges(changes);
      expect(component.completedFiles.length).toBe(1);
      expect(component.completedFiles[0].name).toBe('test.jpg');
      expect(component.completedFiles[0].type).toBe('image');
      expect(component.completedFiles[0].attachmentType).toBe(AttachmentType.PORTRAIT_PHOTO);
    });
  });

  describe('base64ToFile', () => {
    it('should convert base64 to File for PDF', () => {
      const base64 = 'JVBERi0xLjAK';
      const file = component.base64ToFile(base64, 'test.pdf', AttachmentType.IDENTIFICATION);
      expect(file.type).toBe('application/pdf');
      expect(file.name).toBe('test.pdf');
    });

    it('should convert base64 to File for image', () => {
      const base64 = '/9j/4AAQSkZJRg==';
      const file = component.base64ToFile(base64, 'test.jpg', AttachmentType.PORTRAIT_PHOTO);
      expect(file.type).toBe('image/jpeg');
      expect(file.name).toBe('test.jpg');
    });
  });

  describe('getMimeTypeFromType', () => {
    it('should return correct MIME type for IDENTIFICATION', () => {
      expect(component.getMimeTypeFromType(AttachmentType.IDENTIFICATION)).toBe('application/pdf');
    });

    it('should return correct MIME type for PORTRAIT_PHOTO', () => {
      expect(component.getMimeTypeFromType(AttachmentType.PORTRAIT_PHOTO)).toBe('image/jpeg');
    });

    it('should return default MIME type for unknown type', () => {
      expect(component.getMimeTypeFromType('UNKNOWN' as AttachmentType)).toBe('application/octet-stream');
    });
  });

  describe('onSelectedFiles', () => {
    it('should reject more than two files', () => {
      component.completedFiles = [
        {
          name: 'file1.pdf',
          size: 100,
          type: 'pdf' as 'pdf' | 'image',
          date: new Date(),
          file: mockFile,
          attachmentType: AttachmentType.IDENTIFICATION,
        },
        {
          name: 'file2.jpg',
          size: 100,
          type: 'image' as 'pdf' | 'image',
          date: new Date(),
          file: mockFile,
          attachmentType: AttachmentType.PORTRAIT_PHOTO,
        },
      ];
      const event = { files: [new File([''], 'file3.pdf', { type: 'application/pdf' })] };
      component.onSelectedFiles(event);
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Límite excedido',
        detail: 'Solo se permiten hasta dos archivos (Identificación y Foto).'
      });
    });

    it('should reject duplicate attachment types', () => {
      component.completedFiles = [
        {
          name: 'file1.pdf',
          size: 100,
          type: 'pdf' as 'pdf' | 'image',
          date: new Date(),
          file: mockFile,
          attachmentType: AttachmentType.IDENTIFICATION,
        },
      ];
      const event = { files: [new File([''], 'file2.pdf', { type: 'application/pdf' })] };
      component.onSelectedFiles(event);
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Archivo duplicado',
        detail: 'Ya se ha cargado un archivo de tipo Identificación.'
      });
    });

    it('should accept valid files and update completedFiles', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const event = { files: [file] };
      component.onSelectedFiles(event);
      expect(component.completedFiles.length).toBe(1);
      expect(component.completedFiles[0].name).toBe('test.jpg');
      expect(component.completedFiles[0].type).toBe('image');
      expect(component.showSaveWarning).toBeTrue();
    });

    it('should reject invalid files', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const event = { files: [file] };
      component.onSelectedFiles(event);
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Archivo no válido',
        detail: 'El archivo test.txt no es válido o excede los 5MB.'
      });
    });
  });

  describe('removeCompletedFile', () => {
    it('should remove file from completedFiles and revoke object URL', () => {
      const file = {
        name: 'test.jpg',
        size: 100,
        type: 'image' as 'pdf' | 'image',
        date: new Date(),
        file: mockFile,
        attachmentType: AttachmentType.PORTRAIT_PHOTO,
        objectURL: 'blob://test',
      };
      component.completedFiles = [file];
      spyOn(URL, 'revokeObjectURL');
      component.removeCompletedFile(0);
      expect(component.completedFiles.length).toBe(0);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob://test');
    });
  });

  describe('updateTotalSize', () => {
    it('should calculate total size and percentage', () => {
      component.completedFiles = [
        {
          name: 'file1.pdf',
          size: 1024,
          type: 'pdf' as 'pdf' | 'image',
          date: new Date(),
          file: mockFile,
          attachmentType: AttachmentType.IDENTIFICATION,
        },
      ];
      component.updateTotalSize();
      expect(component.totalSize).toBe('1 MB');
      expect(component.totalSizePercent).toBe(20); // 1MB out of 5MB
    });
  });

  describe('formatSize', () => {
    it('should format bytes to appropriate unit', () => {
      expect(component.formatSize(0)).toBe('0B');
      expect(component.formatSize(1024)).toBe('1 KB');
      expect(component.formatSize(1024 * 1024)).toBe('1 MB');
      expect(component.formatSize(1024 * 1024 * 1024)).toBe('1 GB');
    });
  });

  describe('guardar', () => {
    it('should show warning if no files to save', () => {
      component.completedFiles = [];
      component.guardar();
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay documentos para guardar',
      });
    });

    it('should upload files successfully', fakeAsync(() => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      component.completedFiles = [
        {
          name: 'test.jpg',
          size: 100,
          type: 'image' as 'pdf' | 'image',
          date: new Date(),
          file,
          attachmentType: AttachmentType.PORTRAIT_PHOTO,
        },
      ];
      attachmentServiceSpy.uploadDocument.and.returnValue(of(void 0));
      component.guardar();
      tick();
      expect(attachmentServiceSpy.uploadDocument).toHaveBeenCalled();
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Se han guardado los documentos',
      });
      expect(component.showSaveWarning).toBeFalse();
    }));

    it('should handle upload error', fakeAsync(() => {
      const file = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      component.completedFiles = [
        {
          name: 'test.jpg',
          size: 100,
          type: 'image' as 'pdf' | 'image',
          date: new Date(),
          file,
          attachmentType: AttachmentType.PORTRAIT_PHOTO,
        },
      ];
      attachmentServiceSpy.uploadDocument.and.returnValue(throwError(() => new Error('Upload failed')));
      component.guardar();
      tick();
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al guardar los documentos',
      });
    }));
  });

  describe('aprobarDocumentos', () => {
    it('should call aprobarDocumentos and update documentosAprobados', () => {
      component.contratoId = '123';
      contratacionesServiceSpy.aprobarDocumentos.and.returnValue(of({}));
      component.aprobarDocumentos();
      expect(contratacionesServiceSpy.aprobarDocumentos).toHaveBeenCalledWith('123');
      expect(component.documentosAprobados).toBeTrue();
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Documentos aprobados',
      });
    });
  });

  describe('mostrarModalRechazo', () => {
    it('should show rejection modal', () => {
      component.mostrarModalRechazo();
      expect(component.modalRechazoVisible).toBeTrue();
    });
  });

  describe('cerrarModal', () => {
    it('should close rejection modal and reset form', () => {
      component.modalRechazoVisible = true;
      component.formSubmitted = true;
      component.observacionRechazo = 'Test reason';
      component.cerrarModal();
      expect(component.modalRechazoVisible).toBeFalse();
      expect(component.formSubmitted).toBeFalse();
      expect(component.observacionRechazo).toBe('');
    });
  });

  describe('rechazarDocumentos', () => {
    it('should not proceed if observacionRechazo is empty', () => {
      component.formSubmitted = true;
      component.observacionRechazo = '';
      component.rechazarDocumentos();
      expect(component.procesando).toBeFalse();
    });
  });

  describe('validateFile', () => {
    it('should validate file type and size', () => {
      const validFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const invalidFile = new File([''], 'test.txt', { type: 'text/plain' });
      const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });

      expect(component.validateFile(validFile)).toBeTrue();
      expect(component.validateFile(invalidFile)).toBeFalse();
      expect(component.validateFile(largeFile)).toBeFalse();
    });
  });

  describe('getFileType', () => {
    it('should return correct file type', () => {
      expect(component.getFileType('application/pdf')).toBe('PDF');
      expect(component.getFileType('image/jpeg')).toBe('Imagen');
      expect(component.getFileType('text/plain')).toBe('Desconocido');
    });
  });

  describe('verDocumento', () => {
    it('should open file in new window', () => {
      spyOn(window, 'open');
      const doc = { objectURL: 'blob://test', file: mockFile };
      component.verDocumento(doc);
      expect(window.open).toHaveBeenCalledWith('blob://test', '_blank');
    });
  });
});