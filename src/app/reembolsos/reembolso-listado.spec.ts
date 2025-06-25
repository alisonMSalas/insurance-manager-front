import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReembolsoListadoComponent } from './reembolso-listado';
import { RefundService } from '../core/services/refund.service';
import { ContratacionesService } from '../core/services/contrataciones.service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { Refund, RefundStatus } from '../shared/interfaces/refund';
import { Contract } from '../shared/interfaces/contract';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ReembolsoListadoComponent', () => {
  let component: ReembolsoListadoComponent;
  let fixture: ComponentFixture<ReembolsoListadoComponent>;
  let mockRefundService: jasmine.SpyObj<RefundService>;
  let mockContratacionesService: jasmine.SpyObj<ContratacionesService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockSanitizer: jasmine.SpyObj<DomSanitizer>;

  beforeEach(async () => {
    mockRefundService = jasmine.createSpyObj('RefundService', ['getAll', 'create', 'approve', 'reject']);
    mockContratacionesService = jasmine.createSpyObj('ContratacionesService', ['getAll', 'getById']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);
    mockSanitizer = jasmine.createSpyObj('DomSanitizer', ['bypassSecurityTrustResourceUrl']);

    await TestBed.configureTestingModule({
      imports: [
        ReembolsoListadoComponent,
        HttpClientTestingModule
      ],
      providers: [
        { provide: RefundService, useValue: mockRefundService },
        { provide: ContratacionesService, useValue: mockContratacionesService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: DomSanitizer, useValue: mockSanitizer },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReembolsoListadoComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6IkFETUlOIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c');
  });

  afterEach(() => {
    if ((localStorage.getItem as any).and) {
      (localStorage.getItem as any).and.callThrough();
    }
    if ((localStorage.setItem as any).and) {
      (localStorage.setItem as any).and.callThrough();
    }
    if ((localStorage.removeItem as any).and) {
      (localStorage.removeItem as any).and.callThrough();
    }
    if ((localStorage.clear as any).and) {
      (localStorage.clear as any).and.callThrough();
    }
    TestBed.resetTestingModule();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar y cargar reembolsos y contratos', fakeAsync(() => {
    const mockReembolsos: Refund[] = [
      { 
        id: '1',
        refundType: 'tipo', 
        description: 'descripción', 
        observation: 'observación', 
        amountPaid: 100, 
        coveredAmount: 80, 
        contractId: '1', 
        attachments: [], 
        status: 'NEW' as RefundStatus, 
        date: new Date().toISOString() 
      }
    ];
    const mockContracts: Contract[] = [
      { 
        _id: '1', 
        insurance: { name: 'Seguro' }, 
        client: { lastName: 'Apellido', name: 'Nombre' } 
      } as any
    ];
    
    mockRefundService.getAll.and.returnValue(of(mockReembolsos));
    mockContratacionesService.getById.and.returnValue(of(mockContracts[0]));
    mockContratacionesService.getAll.and.returnValue(of(mockContracts));

    component.ngOnInit();
    tick();

    expect(component.reembolsos.length).toBe(1);
    expect(component.contracts.length).toBe(1);
    expect(component.userRole).toBe('ADMIN');
  }));

  it('debe manejar error al cargar reembolsos', fakeAsync(() => {
    mockRefundService.getAll.and.returnValue(throwError(() => new Error('error')));
    mockContratacionesService.getAll.and.returnValue(of([]));
    
    component.ngOnInit();
    tick();
    
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los reembolsos.'
    });
  }));

  it('debe filtrar reembolsos por tipo y estado', () => {
    component.reembolsos = [
      { 
        id: '1',
        refundType: 'tipoA', 
        description: 'descripción', 
        observation: 'observación', 
        amountPaid: 100, 
        coveredAmount: 80, 
        contractId: '1', 
        attachments: [], 
        status: 'NEW' as RefundStatus, 
        date: new Date().toISOString() 
      },
      { 
        id: '2',
        refundType: 'tipoB', 
        description: 'descripción', 
        observation: 'observación', 
        amountPaid: 200, 
        coveredAmount: 160, 
        contractId: '2', 
        attachments: [], 
        status: 'APPROVED' as RefundStatus, 
        date: new Date().toISOString() 
      }
    ];
    
    component.filtroTipo = 'tipoA';
    component.filtroEstado = 'NEW';
    
    const filtrados = component.reembolsosFiltrados();
    expect(filtrados.length).toBe(1);
    expect(filtrados[0].refundType).toBe('tipoA');
  });

  it('debe formatear fecha correctamente', () => {
    const fecha = '2024-06-18T00:00:00.000Z';
    expect(component.formatFecha(fecha)).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    expect(component.formatFecha(undefined)).toBe('-');
  });

  it('debe formatear estado correctamente', () => {
    expect(component.formatStatus('NEW')).toBe('Nuevo');
    expect(component.formatStatus('APPROVED')).toBe('Aprobado');
    expect(component.formatStatus('REJECTED')).toBe('Rechazado');
    expect(component.formatStatus('OTRO')).toBe('OTRO');
  });

  it('debe validar permisos de usuario', () => {
    component.userRole = 'ADMIN';
    expect(component.canCreateRefund()).toBeTrue();
    expect(component.canViewRefunds()).toBeTrue();
    expect(component.canProcessRefund()).toBeTrue();
    
    component.userRole = 'CLIENT';
    expect(component.canCreateRefund()).toBeTrue();
    expect(component.canViewRefunds()).toBeTrue();
    expect(component.canProcessRefund()).toBeFalse();
    
    component.userRole = 'OTRO';
    expect(component.canCreateRefund()).toBeFalse();
  });

  it('debe abrir modal de crear reembolso', () => {
    component.abrirModalCrear();
    
    expect(component.crearModalVisible).toBeTrue();
    expect(component.newRefund.refundType).toBe('');
    expect(component.pendingFiles.length).toBe(0);
    expect(component.formSubmitted).toBeFalse();
  });

  it('debe manejar selección de archivos', () => {
    const mockFile = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
    const event = { files: [mockFile] };
    
    component.onSelectedFiles(event);
    
    expect(component.pendingFiles.length).toBe(1);
    expect(component.pendingFiles[0]).toBe(mockFile);
  });

  it('debe mostrar advertencia si se excede el límite de archivos', () => {
    const mockFile = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
    component.pendingFiles = [mockFile, mockFile, mockFile]; // 3 archivos ya
    const event = { files: [mockFile, mockFile] }; // intentar agregar 2 más (total 5)
    
    component.onSelectedFiles(event);
    
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Límite Excedido',
      detail: 'No se pueden adjuntar más de 3 archivos.'
    });
    expect(component.pendingFiles.length).toBe(3); // no se agregaron los nuevos
  });

  it('debe remover archivo pendiente', () => {
    const mockFile = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
    component.pendingFiles = [mockFile];
    
    component.removePendingFile(0);
    
    expect(component.pendingFiles.length).toBe(0);
  });

  it('debe formatear tamaño de archivo correctamente', () => {
    expect(component.formatSize(0)).toBe('0 Bytes');
    expect(component.formatSize(1024)).toBe('1 KB');
    expect(component.formatSize(1048576)).toBe('1 MB');
  });

  it('debe obtener URL de vista previa de archivo', () => {
    const mockFile = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
    spyOn(URL, 'createObjectURL').and.returnValue('blob:test-url');
    
    const result = component.getFilePreviewUrl(mockFile);
    
    expect(result).toBe('blob:test-url');
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
  });

  it('debe mostrar modal de reembolso', () => {
    const mockReembolso: Refund = {
      id: '1',
      refundType: 'tipo',
      description: 'descripción',
      observation: 'observación',
      amountPaid: 100,
      coveredAmount: 80,
      contractId: '1',
      attachments: [],
      status: 'NEW' as RefundStatus,
      date: new Date().toISOString()
    };
    
    component.mostrarModalReembolso(mockReembolso);
    
    expect(component.reembolsoSeleccionado).toBe(mockReembolso);
    expect(component.modalVisible).toBeTrue();
  });

  it('debe aprobar reembolso exitosamente', fakeAsync(() => {
    const mockReembolso: Refund = {
      id: '1',
      refundType: 'tipo',
      description: 'descripción',
      observation: 'observación',
      amountPaid: 100,
      coveredAmount: 80,
      contractId: '1',
      attachments: [],
      status: 'NEW' as RefundStatus,
      date: new Date().toISOString()
    };
    
    mockRefundService.approve.and.returnValue(of(void 0));
    spyOn(component, 'cargarReembolsos');
    
    component.aprobarReembolso(mockReembolso);
    tick();
    
    expect(mockRefundService.approve).toHaveBeenCalledWith('1');
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Reembolso aprobado correctamente.'
    });
    expect(component.cargarReembolsos).toHaveBeenCalled();
  }));

  it('debe cerrar modal', () => {
    component.modalVisible = true;
    component.crearModalVisible = true;
    component.reembolsoSeleccionado = {} as Refund;
    
    component.cerrarModal();
    
    expect(component.modalVisible).toBeFalse();
    expect(component.crearModalVisible).toBeFalse();
    expect(component.reembolsoSeleccionado).toBeNull();
  });

  it('debe mostrar modal de rechazo', () => {
    const mockReembolso: Refund = {
      id: '1',
      refundType: 'tipo',
      description: 'descripción',
      observation: 'observación',
      amountPaid: 100,
      coveredAmount: 80,
      contractId: '1',
      attachments: [],
      status: 'NEW' as RefundStatus,
      date: new Date().toISOString()
    };
    
    component.mostrarModalRechazo(mockReembolso);
    
    expect(component.reembolsoSeleccionadoParaRechazo).toBe(mockReembolso);
    expect(component.rejectReason).toBe('');
    expect(component.rechazoFormSubmitted).toBeFalse();
    expect(component.rechazarModalVisible).toBeTrue();
  });

  it('debe cancelar rechazo', () => {
    component.rechazarModalVisible = true;
    component.reembolsoSeleccionadoParaRechazo = {} as Refund;
    component.rejectReason = 'razón';
    component.rechazoFormSubmitted = true;
    
    component.cancelarRechazo();
    
    expect(component.rechazarModalVisible).toBeFalse();
    expect(component.reembolsoSeleccionadoParaRechazo).toBeNull();
    expect(component.rejectReason).toBe('');
    expect(component.rechazoFormSubmitted).toBeFalse();
  });

  it('debe sanitizar imagen base64', () => {
    const base64 = 'base64string';
    const safeUrl = 'safe:url' as SafeResourceUrl;
    mockSanitizer.bypassSecurityTrustResourceUrl.and.returnValue(safeUrl);
    
    const result = component.sanitizarBase64Image(base64);
    
    expect(result).toBe(safeUrl);
    expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(`data:image/jpeg;base64,${base64}`);
  });

  it('debe verificar si es PDF', () => {
    expect(component.esPDF('archivo.pdf')).toBeTrue();
    expect(component.esPDF('archivo.PDF')).toBeTrue();
    expect(component.esPDF('archivo.jpg')).toBeFalse();
    expect(component.esPDF('')).toBeFalse();
  });

  it('debe sanitizar PDF base64', () => {
    const base64 = 'base64string';
    const safeUrl = 'safe:url' as SafeResourceUrl;
    mockSanitizer.bypassSecurityTrustResourceUrl.and.returnValue(safeUrl);
    
    const result = component.sanitizarBase64Pdf(base64);
    
    expect(result).toBe(safeUrl);
    expect(mockSanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(`data:application/pdf;base64,${base64}`);
  });

  it('debe mostrar error si los campos obligatorios están vacíos al guardar reembolso', fakeAsync(() => {
    component.newRefund = {
      refundType: '',
      description: '',
      observation: '',
      amountPaid: 0,
      coveredAmount: 0,
      contractId: '',
      attachments: [],
      status: 'NEW',
      date: new Date().toISOString()
    };
    component.pendingFiles = [];
    component.guardarReembolso();
    tick();
    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      detail: 'Complete todos los campos obligatorios con valores válidos.'
    }));
  }));

  it('debe manejar error al convertir archivo a base64 en guardarReembolso', fakeAsync(() => {
    const mockFile = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
    component.newRefund = {
      refundType: 'tipo',
      description: 'desc',
      observation: 'obs',
      amountPaid: 10,
      coveredAmount: 5,
      contractId: '1',
      attachments: [],
      status: 'NEW',
      date: new Date().toISOString()
    };
    component.pendingFiles = [mockFile];
    spyOn(component as any, 'fileToBase64').and.returnValue(Promise.reject('error'));
    component.guardarReembolso();
    tick();
    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      detail: 'Error al procesar los archivos adjuntos.'
    }));
  }));

  it('no debe llamar al servicio si el reembolso no tiene id al aprobar', () => {
    const mockReembolso: Refund = { ...component.newRefund, id: undefined };
    component.aprobarReembolso(mockReembolso);
    expect(mockRefundService.approve).not.toHaveBeenCalled();
  });

  it('no debe llamar al servicio si no hay motivo de rechazo', () => {
    component.reembolsoSeleccionadoParaRechazo = { ...component.newRefund, id: '1' };
    component.rejectReason = '';
    component.confirmarRechazo();
    expect(mockRefundService.reject).not.toHaveBeenCalled();
  });

  it('no debe llamar al servicio si no hay reembolso seleccionado para rechazo', () => {
    component.reembolsoSeleccionadoParaRechazo = null;
    component.rejectReason = 'Motivo';
    component.confirmarRechazo();
    expect(mockRefundService.reject).not.toHaveBeenCalled();
  });

  it('debe manejar error en fileToBase64', async () => {
    const mockFile = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
    const originalFileReader = (window as any).FileReader;
    (window as any).FileReader = function() {
      this.readAsDataURL = () => { this.onerror('error'); };
    };
    const promise = (component as any).fileToBase64(mockFile);
    await expectAsync(promise).toBeRejected();
    (window as any).FileReader = originalFileReader;
  });

  it('debe formatear tamaños extremos correctamente', () => {
    expect(component.formatSize(0)).toBe('0 Bytes');
    expect(component.formatSize(1048576)).toContain('MB'); // 1MB = 1024*1024 bytes
  });

  it('debe manejar getFilePreviewUrl con archivo nulo', () => {
    expect(() => component.getFilePreviewUrl(null as any)).toThrow();
  });

  it('debe manejar esPDF con nombres edge', () => {
    expect(component.esPDF('')).toBeFalse();
    expect(component.esPDF('archivo')).toBeFalse();
    expect(component.esPDF('archivo.PDF')).toBeTrue();
    expect(component.esPDF('archivo.pdf')).toBeTrue();
  });

  it('debe sanitizar imagen y pdf base64 vacío', () => {
    mockSanitizer.bypassSecurityTrustResourceUrl.and.returnValue('safe:url' as any);
    expect(component.sanitizarBase64Image('')).toBe('safe:url' as any);
    expect(component.sanitizarBase64Pdf('')).toBe('safe:url' as any);
  });

  it('debe manejar ngOnInit con userRole null', fakeAsync(() => {
    spyOn(component as any, 'getUserRole').and.returnValue(null);
    spyOn(component, 'cargarReembolsos');
    spyOn(component, 'cargarContratos');
    component.ngOnInit();
    expect(component.userRole).toBeNull();
    expect(component.cargarReembolsos).toHaveBeenCalled();
    expect(component.cargarContratos).toHaveBeenCalled();
  }));

  it('debe filtrar correctamente cuando no hay filtro', () => {
    component.reembolsos = [
      { refundType: 'tipoA', status: 'NEW', contractId: '', description: '', observation: '', amountPaid: 0, coveredAmount: 0, attachments: [], date: '', id: '1' }
    ];
    component.filtroTipo = '';
    component.filtroEstado = '';
    expect(component.reembolsosFiltrados().length).toBe(1);
  });

  it('debe filtrar correctamente por tipo', () => {
    component.reembolsos = [
      { refundType: 'tipoA', status: 'NEW', contractId: '', description: '', observation: '', amountPaid: 0, coveredAmount: 0, attachments: [], date: '', id: '1' },
      { refundType: 'tipoB', status: 'NEW', contractId: '', description: '', observation: '', amountPaid: 0, coveredAmount: 0, attachments: [], date: '', id: '2' }
    ];
    component.filtroTipo = 'tipoA';
    component.filtroEstado = '';
    expect(component.reembolsosFiltrados().length).toBe(1);
  });

  it('debe filtrar correctamente por estado', () => {
    component.reembolsos = [
      { refundType: 'tipoA', status: 'NEW', contractId: '', description: '', observation: '', amountPaid: 0, coveredAmount: 0, attachments: [], date: '', id: '1' },
      { refundType: 'tipoB', status: 'APPROVED', contractId: '', description: '', observation: '', amountPaid: 0, coveredAmount: 0, attachments: [], date: '', id: '2' }
    ];
    component.filtroTipo = '';
    component.filtroEstado = 'APPROVED';
    expect(component.reembolsosFiltrados().length).toBe(1);
  });

  it('debe filtrar correctamente por tipo y estado', () => {
    component.reembolsos = [
      { refundType: 'tipoA', status: 'NEW', contractId: '', description: '', observation: '', amountPaid: 0, coveredAmount: 0, attachments: [], date: '', id: '1' },
      { refundType: 'tipoA', status: 'APPROVED', contractId: '', description: '', observation: '', amountPaid: 0, coveredAmount: 0, attachments: [], date: '', id: '2' }
    ];
    component.filtroTipo = 'tipoA';
    component.filtroEstado = 'APPROVED';
    expect(component.reembolsosFiltrados().length).toBe(1);
  });

  it('debe manejar error al cargar contratos en cargarReembolsos', fakeAsync(() => {
    const mockReembolsos: Refund[] = [
      { id: '1', refundType: 'tipo', description: '', observation: '', amountPaid: 0, coveredAmount: 0, contractId: '1', attachments: [], status: 'NEW', date: new Date().toISOString() }
    ];
    mockRefundService.getAll.and.returnValue(of(mockReembolsos));
    mockContratacionesService.getById.and.returnValue(throwError(() => new Error('error')));
    component.cargarReembolsos();
    tick();
    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      detail: 'No se pudieron cargar los datos de contratos.'
    }));
  }));

  it('debe manejar error al cargar contratos en cargarContratos', fakeAsync(() => {
    mockContratacionesService.getAll.and.returnValue(throwError(() => new Error('error')));
    component.cargarContratos();
    tick();
    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      detail: 'No se pudieron cargar los contratos.'
    }));
  }));

  it('debe manejar error al crear reembolso en guardarReembolso', fakeAsync(() => {
    const mockFile = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
    component.newRefund = {
      refundType: 'tipo',
      description: 'desc',
      observation: 'obs',
      amountPaid: 10,
      coveredAmount: 5,
      contractId: '1',
      attachments: [],
      status: 'NEW',
      date: new Date().toISOString()
    };
    component.pendingFiles = [mockFile];
    spyOn(component as any, 'fileToBase64').and.returnValue(Promise.resolve('data:application/pdf;base64,base64string'));
    mockRefundService.create.and.returnValue(throwError(() => ({ error: { message: 'Error al crear' } })));
    component.guardarReembolso();
    tick();
    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      detail: 'Error al crear'
    }));
  }));

  it('debe manejar error al aprobar reembolso', fakeAsync(() => {
    const mockReembolso: Refund = {
      id: '1',
      refundType: 'tipo',
      description: 'desc',
      observation: 'obs',
      amountPaid: 10,
      coveredAmount: 5,
      contractId: '1',
      attachments: [],
      status: 'NEW',
      date: new Date().toISOString()
    };
    mockRefundService.approve.and.returnValue(throwError(() => new Error('error')));
    component.aprobarReembolso(mockReembolso);
    tick();
    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      detail: 'No se pudo aprobar el reembolso.'
    }));
  }));

  it('debe manejar error al rechazar reembolso', fakeAsync(() => {
    const mockReembolso: Refund = {
      id: '1',
      refundType: 'tipo',
      description: 'desc',
      observation: 'obs',
      amountPaid: 10,
      coveredAmount: 5,
      contractId: '1',
      attachments: [],
      status: 'NEW',
      date: new Date().toISOString()
    };
    component.reembolsoSeleccionadoParaRechazo = mockReembolso;
    component.rejectReason = 'Motivo';
    mockRefundService.reject.and.returnValue(throwError(() => new Error('error')));
    component.confirmarRechazo();
    tick();
    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      detail: 'No se pudo rechazar el reembolso.'
    }));
  }));

  it('debe manejar token inválido en getUserRole', () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue('token-invalido');
    const role = (component as any).getUserRole();
    expect(role).toBeNull();
  });

  it('debe retornar - si la fecha es undefined en formatFecha', () => {
    expect(component.formatFecha(undefined)).toBe('-');
  });

  it('debe retornar el estado original si no es conocido en formatStatus', () => {
    expect(component.formatStatus('DESCONOCIDO')).toBe('DESCONOCIDO');
  });

  it('debe manejar confirmarRechazo exitoso', fakeAsync(() => {
    const mockReembolso: Refund = {
      id: '1',
      refundType: 'tipo',
      description: 'desc',
      observation: 'obs',
      amountPaid: 10,
      coveredAmount: 5,
      contractId: '1',
      attachments: [],
      status: 'NEW',
      date: new Date().toISOString()
    };
    component.reembolsoSeleccionadoParaRechazo = mockReembolso;
    component.rejectReason = 'Motivo';
    mockRefundService.reject.and.returnValue(of(void 0));
    spyOn(component, 'cargarReembolsos');
    component.confirmarRechazo();
    tick();
    expect(mockRefundService.reject).toHaveBeenCalledWith('1', 'Motivo');
    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      detail: 'Reembolso rechazado correctamente.'
    }));
    expect(component.cargarReembolsos).toHaveBeenCalled();
  }));

  it('debe manejar guardarReembolso exitoso', fakeAsync(() => {
    const mockFile = new File(['contenido'], 'test.pdf', { type: 'application/pdf' });
    component.newRefund = {
      refundType: 'tipo',
      description: 'desc',
      observation: 'obs',
      amountPaid: 10,
      coveredAmount: 5,
      contractId: '1',
      attachments: [],
      status: 'NEW',
      date: new Date().toISOString()
    };
    component.pendingFiles = [mockFile];
    spyOn(component as any, 'fileToBase64').and.returnValue(Promise.resolve('data:application/pdf;base64,base64string'));
    mockRefundService.create.and.returnValue(of(component.newRefund));
    spyOn(component, 'cargarReembolsos');
    component.guardarReembolso();
    tick();
    expect(mockRefundService.create).toHaveBeenCalled();
    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      detail: 'Reembolso creado correctamente.'
    }));
    expect(component.cargarReembolsos).toHaveBeenCalled();
  }));
}); 