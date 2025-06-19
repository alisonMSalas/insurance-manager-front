import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DocumentacionComponent } from './documentacion.component';
import { AttachmentService } from '../../../core/services/attachment.service';
import { ContratacionesService } from '../../../core/services/contrataciones.service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { AttachmentType } from '../../../shared/interfaces/attachment';
import { Contract } from '../../../shared/interfaces/contract';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DocumentacionComponent (integración)', () => {
  let component: DocumentacionComponent;
  let fixture: ComponentFixture<DocumentacionComponent>;

  let mockAttachmentService: jasmine.SpyObj<AttachmentService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockContratacionesService: jasmine.SpyObj<ContratacionesService>;

  beforeEach(async () => {
    mockAttachmentService = jasmine.createSpyObj('AttachmentService', ['uploadDocument']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);
    mockContratacionesService = jasmine.createSpyObj('ContratacionesService', ['aprobarDocumentos']);

    await TestBed.configureTestingModule({
      imports: [
        DocumentacionComponent,
        HttpClientTestingModule
      ],
      providers: [
        { provide: AttachmentService, useValue: mockAttachmentService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ContratacionesService, useValue: mockContratacionesService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentacionComponent);
    component = fixture.componentInstance;
    
    // Mock del fileUpload para evitar errores
    component.fileUpload = { 
      clear: jasmine.createSpy('clear'), 
      files: [] 
    } as any;
  });

  it('debe inicializar con valores por defecto', () => {
    expect(component.completedFiles).toEqual([]);
    expect(component.documentosGuardados).toBeFalse();
    expect(component.showSaveWarning).toBeFalse();
    expect(component.pendingFiles).toEqual([]);
    expect(component.totalSize).toBe('0B');
    expect(component.totalSizePercent).toBe(0);
  });

  it('debe ejecutar ngOnInit sin errores', () => {
    expect(() => component.ngOnInit()).not.toThrow();
  });

  it('debe mostrar error si no hay documentos al guardar', () => {
    component.completedFiles = [];
    component.guardar();

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Advertencia',
      detail: 'No hay documentos para guardar',
    });
  });

  it('debe convertir base64 a archivo correctamente', () => {
    const base64 = btoa('contenido');
    const file = component.base64ToFile(base64, 'test.pdf', AttachmentType.IDENTIFICATION);
    expect(file instanceof File).toBeTrue();
    expect(file.name).toBe('test.pdf');
  });

  it('debe convertir base64 a archivo con tipo de foto de retrato', () => {
    const base64 = btoa('contenido de imagen');
    const file = component.base64ToFile(base64, 'foto.jpg', AttachmentType.PORTRAIT_PHOTO);
    expect(file instanceof File).toBeTrue();
    expect(file.name).toBe('foto.jpg');
    expect(file.type).toBe('image/jpeg');
  });

  it('debe convertir base64 a archivo con tipo por defecto', () => {
    const base64 = btoa('contenido desconocido');
    const file = component.base64ToFile(base64, 'archivo.xyz', 'OTRO_TIPO' as AttachmentType);
    expect(file instanceof File).toBeTrue();
    expect(file.name).toBe('archivo.xyz');
    expect(file.type).toBe('application/octet-stream');
  });

  it('debe manejar base64 vacío correctamente', () => {
    const base64 = '';
    const file = component.base64ToFile(base64, 'vacio.pdf', AttachmentType.IDENTIFICATION);
    expect(file instanceof File).toBeTrue();
    expect(file.name).toBe('vacio.pdf');
    expect(file.size).toBe(0);
  });

  it('debe manejar base64 con caracteres especiales', () => {
    const contenido = 'contenido con ñ y áéíóú';
    const base64 = btoa(contenido);
    const file = component.base64ToFile(base64, 'especial.pdf', AttachmentType.IDENTIFICATION);
    expect(file instanceof File).toBeTrue();
    expect(file.name).toBe('especial.pdf');
  });

  it('debe crear ArrayBuffer correctamente desde base64', () => {
    const contenido = 'test content';
    const base64 = btoa(contenido);
    const file = component.base64ToFile(base64, 'test.pdf', AttachmentType.IDENTIFICATION);
    
    // Verificar que el archivo tiene el contenido correcto
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      expect(result).toContain('test content');
    };
    reader.readAsText(file);
  });

  it('debe verificar el proceso completo de conversión base64 a archivo', () => {
    const contenidoOriginal = 'contenido de prueba para verificar conversión';
    const base64 = btoa(contenidoOriginal);
    
    // Verificar que el base64 se decodifica correctamente
    const byteString = atob(base64);
    expect(byteString).toBe(contenidoOriginal);
    
    const file = component.base64ToFile(base64, 'test.pdf', AttachmentType.IDENTIFICATION);
    
    // Verificar que el archivo se crea con el tamaño correcto
    expect(file.size).toBe(contenidoOriginal.length);
    
    // Verificar que el tipo MIME es correcto
    expect(file.type).toBe('application/pdf');
  });

  it('debe manejar diferentes tamaños de contenido en base64', () => {
    const contenidoCorto = 'a';
    const contenidoMedio = 'contenido de tamaño medio para pruebas';
    const contenidoLargo = 'contenido muy largo '.repeat(100);
    
    const fileCorto = component.base64ToFile(btoa(contenidoCorto), 'corto.pdf', AttachmentType.IDENTIFICATION);
    const fileMedio = component.base64ToFile(btoa(contenidoMedio), 'medio.pdf', AttachmentType.IDENTIFICATION);
    const fileLargo = component.base64ToFile(btoa(contenidoLargo), 'largo.pdf', AttachmentType.IDENTIFICATION);
    
    expect(fileCorto.size).toBe(1);
    expect(fileMedio.size).toBe(contenidoMedio.length);
    expect(fileLargo.size).toBe(contenidoLargo.length);
  });

  it('debe obtener el tipo MIME correcto para identificación', () => {
    const mimeType = component.getMimeTypeFromType(AttachmentType.IDENTIFICATION);
    expect(mimeType).toBe('application/pdf');
  });

  it('debe obtener el tipo MIME correcto para foto de retrato', () => {
    const mimeType = component.getMimeTypeFromType(AttachmentType.PORTRAIT_PHOTO);
    expect(mimeType).toBe('image/jpeg');
  });

  it('debe obtener el tipo MIME por defecto para tipos desconocidos', () => {
    const mimeType = component.getMimeTypeFromType('TIPO_DESCONOCIDO' as AttachmentType);
    expect(mimeType).toBe('application/octet-stream');
  });

  it('debe obtener el tipo MIME por defecto para tipos nulos', () => {
    const mimeType = component.getMimeTypeFromType(null as any);
    expect(mimeType).toBe('application/octet-stream');
  });

  it('debe obtener el tipo MIME por defecto para tipos undefined', () => {
    const mimeType = component.getMimeTypeFromType(undefined as any);
    expect(mimeType).toBe('application/octet-stream');
  });

  it('debe validar archivo correctamente', () => {
    const validFile = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
    const invalidFile = new File(['contenido'.repeat(1000000)], 'large.pdf', { type: 'application/pdf' });

    expect(component.validateFile(validFile)).toBeTrue();
    expect(component.validateFile(invalidFile)).toBeFalse();
  });

  it('debe procesar archivos seleccionados correctamente', () => {
    const mockFile = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
    const event = { files: [mockFile] };

    component.onSelectedFiles(event);

    expect(component.completedFiles.length).toBe(1);
    expect(component.completedFiles[0].name).toBe('test.pdf');
    expect(component.completedFiles[0].attachmentType).toBe(AttachmentType.IDENTIFICATION);
  });

  it('debe mostrar error si se excede el límite de archivos', () => {
    const mockFile1 = new File(['contenido1'], 'test1.pdf', { type: 'application/pdf' });
    const mockFile2 = new File(['contenido2'], 'test2.pdf', { type: 'application/pdf' });
    const mockFile3 = new File(['contenido3'], 'test3.pdf', { type: 'application/pdf' });
    
    component.completedFiles = [
      {
        name: 'existing.pdf',
        size: 1,
        type: 'pdf',
        date: new Date(),
        file: mockFile1,
        attachmentType: AttachmentType.IDENTIFICATION
      }
    ];

    const event = { files: [mockFile2, mockFile3] };
    component.onSelectedFiles(event);

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Límite excedido',
      detail: 'Solo se permiten hasta dos archivos (Identificación y Foto).'
    });
  });

  it('debe mostrar error si se intenta cargar archivo duplicado', () => {
    const mockFile = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
    
    component.completedFiles = [
      {
        name: 'existing.pdf',
        size: 1,
        type: 'pdf',
        date: new Date(),
        file: mockFile,
        attachmentType: AttachmentType.IDENTIFICATION
      }
    ];

    const event = { files: [mockFile] };
    component.onSelectedFiles(event);

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Archivo duplicado',
      detail: 'Ya se ha cargado un archivo de tipo Identificación.'
    });
  });

  it('debe remover archivo completado correctamente', () => {
    const mockFile = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
    component.completedFiles = [
      {
        name: 'test.pdf',
        size: 1,
        type: 'pdf',
        date: new Date(),
        file: mockFile,
        attachmentType: AttachmentType.IDENTIFICATION,
        objectURL: 'blob:test'
      }
    ];

    spyOn(URL, 'revokeObjectURL');
    component.removeCompletedFile(0);

    expect(component.completedFiles.length).toBe(0);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test');
  });

  it('debe formatear tamaño correctamente', () => {
    expect(component.formatSize(1024)).toBe('1 KB');
    expect(component.formatSize(1048576)).toBe('1 MB');
    expect(component.formatSize(512)).toBe('512 B');
  });

  it('debe obtener URL de vista previa correctamente', () => {
    const mockDoc = {
      objectURL: 'blob:test-url'
    };

    const result = component.getFilePreviewUrl(mockDoc);
    expect(result).toBe('blob:test-url');
  });

  it('debe aprobar documentos correctamente', () => {
    mockContratacionesService.aprobarDocumentos.and.returnValue(of({} as Contract));

    component.contratoId = 'abc123';

    component.aprobarDocumentos();

    expect(mockContratacionesService.aprobarDocumentos).toHaveBeenCalledWith('abc123');
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Documentos aprobados',
    });
    expect(component.documentosAprobados).toBeTrue();
  });

  it('debe manejar error al aprobar documentos', () => {
    mockContratacionesService.aprobarDocumentos.and.returnValue(throwError(() => new Error('Error de prueba')));

    component.contratoId = 'abc123';

    component.aprobarDocumentos();

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al aprobar documentos',
    });
  });

  it('debe manejar error al aprobar documentos con error en el servicio', () => {
    const error = new Error('Error en el servicio');
    mockContratacionesService.aprobarDocumentos.and.returnValue(throwError(() => error));
    spyOn(console, 'error');

    component.contratoId = 'abc123';

    component.aprobarDocumentos();

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al aprobar documentos',
    });
  });

  it('debe guardar documentos correctamente', fakeAsync(() => {
    const mockFile = new File(['contenido'], 'doc.pdf', { type: 'application/pdf' });

    component.clienteId = 'cliente1';
    component.completedFiles = [
      {
        name: 'doc.pdf',
        size: 1,
        type: 'pdf',
        date: new Date(),
        file: mockFile,
        attachmentType: AttachmentType.IDENTIFICATION
      }
    ];

    mockAttachmentService.uploadDocument.and.returnValue(of(void 0));

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jasmine.createSpy('readAsDataURL'),
      onload: null as any,
      result: 'data:application/pdf;base64,Y29udGVuaWRv'
    };
    spyOn(window, 'FileReader').and.returnValue(mockFileReader as any);

    component.guardar();
    
    // Simular que FileReader terminó de leer
    if (mockFileReader.onload) {
      mockFileReader.onload();
    }
    
    tick();

    expect(mockAttachmentService.uploadDocument).toHaveBeenCalled();
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Se han guardado los documentos',
    });
    expect(component.documentosGuardados).toBeTrue();
    expect(component.showSaveWarning).toBeFalse();
  }));

  it('debe manejar error al guardar documentos', fakeAsync(() => {
    spyOn(console, 'error');
    const mockFile = new File(['contenido'], 'doc.pdf', { type: 'application/pdf' });

    component.clienteId = 'cliente1';
    component.completedFiles = [
      {
        name: 'doc.pdf',
        size: 1,
        type: 'pdf',
        date: new Date(),
        file: mockFile,
        attachmentType: AttachmentType.IDENTIFICATION
      }
    ];

    mockAttachmentService.uploadDocument.and.returnValue(throwError(() => new Error('Error de prueba')));

    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: jasmine.createSpy('readAsDataURL'),
      onload: null as any,
      result: 'data:application/pdf;base64,Y29udGVuaWRv'
    };
    spyOn(window, 'FileReader').and.returnValue(mockFileReader as any);

    component.guardar();
    
    // Simular que FileReader terminó de leer
    if (mockFileReader.onload) {
      mockFileReader.onload();
    }
    
    tick();

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al guardar los documentos',
    });
    expect(console.error).toHaveBeenCalledWith('Error al guardar documentos:', jasmine.any(Error));
  }));

  it('debe mostrar error si no hay clienteId al guardar', () => {
    component.clienteId = '';
    component.completedFiles = [
      {
        name: 'doc.pdf',
        size: 1,
        type: 'pdf',
        date: new Date(),
        file: new File(['contenido'], 'doc.pdf'),
        attachmentType: AttachmentType.IDENTIFICATION
      }
    ];

    component.guardar();

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Client ID no proporcionado',
    });
  });

  it('debe manejar cambios en ngOnChanges correctamente', () => {
    const mockAttachment = {
      fileName: 'test.pdf',
      content: btoa('contenido'),
      attachmentType: AttachmentType.IDENTIFICATION
    };

    const changes = {
      clientAttachments: {
        currentValue: [mockAttachment],
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      }
    };

    spyOn(URL, 'createObjectURL').and.returnValue('blob:test-url');

    component.ngOnChanges(changes);

    expect(component.completedFiles.length).toBe(1);
    expect(component.completedFiles[0].name).toBe('test.pdf');
    expect(component.completedFiles[0].attachmentType).toBe(AttachmentType.IDENTIFICATION);
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('debe filtrar solo archivos de identificación y foto de retrato', () => {
    const mockAttachments = [
      {
        fileName: 'identificacion.pdf',
        content: btoa('contenido1'),
        attachmentType: AttachmentType.IDENTIFICATION
      },
      {
        fileName: 'foto.jpg',
        content: btoa('contenido2'),
        attachmentType: AttachmentType.PORTRAIT_PHOTO
      },
      {
        fileName: 'otro.pdf',
        content: btoa('contenido3'),
        attachmentType: 'OTRO_TIPO' as AttachmentType
      }
    ];

    const changes = {
      clientAttachments: {
        currentValue: mockAttachments,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      }
    };

    spyOn(URL, 'createObjectURL').and.returnValue('blob:test-url');

    component.ngOnChanges(changes);

    expect(component.completedFiles.length).toBe(2);
    expect(component.completedFiles[0].attachmentType).toBe(AttachmentType.IDENTIFICATION);
    expect(component.completedFiles[1].attachmentType).toBe(AttachmentType.PORTRAIT_PHOTO);
  });

  it('debe manejar clientAttachments que no es un array', () => {
    const changes = {
      clientAttachments: {
        currentValue: 'no es un array',
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      }
    };

    component.ngOnChanges(changes);

    expect(component.completedFiles.length).toBe(0);
  });

  it('debe manejar clientAttachments vacío', () => {
    const changes = {
      clientAttachments: {
        currentValue: [],
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      }
    };

    component.ngOnChanges(changes);

    expect(component.completedFiles.length).toBe(0);
  });

  it('debe manejar cambios en clienteId correctamente', () => {
    const changes = {
      clienteId: {
        currentValue: 'nuevo-cliente-id',
        previousValue: 'cliente-anterior',
        firstChange: false,
        isFirstChange: () => false
      }
    };

    component.ngOnChanges(changes);

    // No debería mostrar error porque el clienteId tiene valor
    expect(mockMessageService.add).not.toHaveBeenCalled();
  });

  it('debe mostrar error si clientId está vacío en cambios', () => {
    const changes = {
      clienteId: {
        currentValue: '',
        previousValue: 'cliente-anterior',
        firstChange: false,
        isFirstChange: () => false
      }
    };

    component.ngOnChanges(changes);

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Client ID no proporcionado'
    });
  });

  it('debe manejar múltiples tipos de archivos correctamente', () => {
    const mockAttachments = [
      {
        fileName: 'identificacion.pdf',
        content: btoa('contenido1'),
        attachmentType: AttachmentType.IDENTIFICATION
      },
      {
        fileName: 'foto.jpg',
        content: btoa('contenido2'),
        attachmentType: AttachmentType.PORTRAIT_PHOTO
      }
    ];

    const changes = {
      clientAttachments: {
        currentValue: mockAttachments,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true
      }
    };

    spyOn(URL, 'createObjectURL').and.returnValues('blob:url1', 'blob:url2');

    component.ngOnChanges(changes);

    expect(component.completedFiles.length).toBe(2);
    expect(component.completedFiles[0].type).toBe('pdf');
    expect(component.completedFiles[1].type).toBe('image');
    expect(component.completedFiles[0].objectURL).toBe('blob:url1');
    expect(component.completedFiles[1].objectURL).toBe('blob:url2');
  });

  it('debe obtener tipo de archivo correctamente', () => {
    expect(component.getFileType('application/pdf')).toBe('PDF');
    expect(component.getFileType('image/jpeg')).toBe('Imagen');
    expect(component.getFileType('image/png')).toBe('Imagen');
    expect(component.getFileType('text/plain')).toBe('Desconocido');
    expect(component.getFileType('application/msword')).toBe('Desconocido');
  });

  it('debe manejar el callback de selección de archivos', () => {
    const mockCallback = jasmine.createSpy('callback');
    const mockEvent = new Event('click');

    component.choose(mockEvent, mockCallback);

    expect(mockCallback).toHaveBeenCalled();
  });

  it('debe mostrar modal de rechazo correctamente', () => {
    component.mostrarModalRechazo();

    expect(component.modalRechazoVisible).toBeTrue();
    expect(component.observacionRechazo).toBe('');
  });

  it('debe cerrar modal correctamente', () => {
    component.modalRechazoVisible = true;
    component.observacionRechazo = 'test';

    component.cerrarModal();

    expect(component.modalRechazoVisible).toBeFalse();
    expect(component.observacionRechazo).toBe('');
  });

  it('debe actualizar tamaño total correctamente', () => {
    const mockFile = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
    component.completedFiles = [
      {
        name: 'test.pdf',
        size: 1024, // 1KB
        type: 'pdf',
        date: new Date(),
        file: mockFile,
        attachmentType: AttachmentType.IDENTIFICATION
      }
    ];

    component.updateTotalSize();

    expect(component.totalSize).toBe('1 MB');
    expect(component.totalSizePercent).toBeGreaterThan(0);
  });

  it('debe abrir documento en nueva ventana', () => {
    const mockDoc = {
      objectURL: 'blob:test-url',
      file: new File(['contenido'], 'test.pdf', { type: 'application/pdf' })
    };

    spyOn(window, 'open');

    component.verDocumento(mockDoc);

    expect(window.open).toHaveBeenCalledWith('blob:test-url', '_blank');
  });

  it('debe abrir documento sin objectURL usando URL.createObjectURL', () => {
    const mockFile = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
    const mockDoc = {
      file: mockFile
    };

    spyOn(window, 'open');
    spyOn(URL, 'createObjectURL').and.returnValue('blob:created-url');

    component.verDocumento(mockDoc);

    expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    expect(window.open).toHaveBeenCalledWith('blob:created-url', '_blank');
  });

  it('debe manejar archivos removidos correctamente', () => {
    const mockFiles = [
      new File(['contenido1'], 'file1.pdf', { type: 'application/pdf' }),
      new File(['contenido2'], 'file2.jpg', { type: 'image/jpeg' })
    ];

    // Simular que el fileUpload tiene archivos
    component.fileUpload = {
      files: mockFiles
    } as any;

    const event = { files: mockFiles };
    component.onFileRemoved(event);

    expect(component.pendingFiles).toEqual(mockFiles);
  });
});
