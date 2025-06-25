import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReportesComponent } from './reportes.component';
import { ContratacionesService } from '../core/services/contrataciones.service';
import { of } from 'rxjs';
import { User } from '../core/services/users.service';
import { Attachment, AttachmentType } from '../shared/interfaces/attachment';
import { Client } from '../shared/interfaces/client';
import { ClientContracts } from '../shared/interfaces/clientContract';
import { Contract } from '../shared/interfaces/contract';
import { Insurance, InsuranceType, PaymentPeriod } from '../shared/interfaces/insurance';


const mockUser1: User = {
  id: 'user1',
  name: 'Juan Pérez',
  email: 'juanperez@example.com',
  rol: 'admin',
  active: true
};

const mockUser2: User = {
  id: 'user2',
  name: 'Ana Gómez',
  email: 'anagomez@example.com',
  rol: 'user',
  active: true
};


const mockClient1: Client = {
  id: 'client1',
  name: 'Juan',
  lastName: 'Pérez',
  identificationNumber: '1712345678',
  birthDate: '1980-01-01',
  phoneNumber: '0999999999',
  address: 'Av. Siempre Viva 123',
  gender: 'M',
  occupation: 'Ingeniero',
  active: true,
  user: mockUser1
};

const mockClient2: Client = {
  id: 'client2',
  name: 'Ana',
  lastName: 'Gómez',
  identificationNumber: '1723456789',
  birthDate: '1990-05-15',
  phoneNumber: '0988888888',
  address: 'Calle Falsa 456',
  gender: 'F',
  occupation: 'Abogada',
  active: true,
  user: mockUser2
};

// Mock Seguros
const mockInsurance1: Insurance & { benefits: { id: string; name: string; description: string; }[] } = {
  id: 'ins1',
  name: 'Seguro Vida',
  type: InsuranceType.LIFE,
  description: 'Seguro de vida completo',
  coverage: 100000,
  deductible: 500,
  paymentAmount: 100,
  paymentPeriod: PaymentPeriod.MONTHLY,
  active: true,
  benefits: [
    { id: 'b1', name: 'Cobertura básica', description: 'Beneficio básico' },
    { id: 'b2', name: 'Cobertura adicional', description: 'Beneficio adicional' }
  ]
};


const mockInsurance2: Insurance & { benefits: { id: string; name: string; description: string; }[] } = {
  id: 'ins2',
  name: 'Seguro Salud',
  type: InsuranceType.HEALTH,
  description: 'Seguro de salud para emergencias',
  coverage: 50000,
  deductible: 300,
  paymentAmount: 150,
  paymentPeriod: PaymentPeriod.YEARLY,
  active: true,
  benefits: [] // siempre debe estar definido como arreglo
};

// Mock Attachments
const mockAttachment1: Attachment = {
  id: 'att1',
  content: 'base64string1',
  attachmentType: AttachmentType.IDENTIFICATION,
  fileName: 'cedula.pdf'
};

const mockAttachment2: Attachment = {
  id: 'att2',
  content: 'base64string2',
  attachmentType: AttachmentType.PAYMENT_PROOF,
  fileName: 'comprobante.pdf'
};

// Mock Contratos
const mockContract1: Contract = {
  id: 'contract1',
  startDate: '2025-01-01',
  status: 'Unpaid',
  totalPaymentAmount: 1000,
  insuranceId: 'ins1',
  clientId: 'client1',
  active: true,
  client: mockClient1,
  insurance: mockInsurance1,
  beneficiaries: [
    {
      id: 'ben1',
      name: 'Carlos',
      lastName: 'Pérez',
      identificationNumber: '1234567890',
      relationship: 'Hijo',
      phoneNumber: '0999999999'
    }
  ],
  clientAttachments: [mockAttachment1],
  contractFile: 'contrato1.pdf',
  stepStatuses: {
    UPLOAD_DOCUMENTS: true,
    DOCUMENT_APPROVAL: false,
    PAYMENT_APPROVAL: false,
    CLIENT_APPROVAL: false
  }
};


const mockContract2: Contract = {
  id: 'contract2',
  startDate: '2024-12-01',
  status: 'Active',
  totalPaymentAmount: 2000,
  insuranceId: 'ins2',
  clientId: 'client2',
  active: true,
  client: mockClient2,
  insurance: mockInsurance2,
  beneficiaries: [],
  clientAttachments: [mockAttachment2],
  contractFile: 'contrato2.pdf',
  stepStatuses: {
    UPLOAD_DOCUMENTS: true,
    DOCUMENT_APPROVAL: true,
    PAYMENT_APPROVAL: false,
    CLIENT_APPROVAL: false
  }
};

// Contratos agrupados por cliente
const mockClientContracts1: ClientContracts = {
  client: mockClient1,
  contracts: [mockContract1]
};

const mockClientContracts2: ClientContracts = {
  client: mockClient2,
  contracts: [mockContract2]
};

// Exporta para usar en tests
export const mockUsers = [mockUser1, mockUser2];
export const mockClients = [mockClient1, mockClient2];
export const mockContracts = [mockContract1, mockContract2];
export const mockClientContracts = [mockClientContracts1, mockClientContracts2];

// Para pruebas unitarias concretas
export const mockUnpaidContracts = [mockContract1];
export const mockExpiringSoonContracts = [mockContract2];
export const mockExpiredContracts: Contract[] = [];
export const mockPendingContracts: Contract[] = [];
export const mockGroupedContracts = mockClientContracts;

const mockContratacionesService = {
  getUnpaidContracts: () => of(mockUnpaidContracts),
  getExpiringSoonContracts: () => of(mockExpiringSoonContracts),
  getExpiredContracts: () => of(mockExpiredContracts),
  getPendingContracts: () => of(mockPendingContracts),
  getContractsGroupedByClient: () => of(mockGroupedContracts),
  getContractPdf: (id: string) => of({
    content: btoa('%PDF-1.4 ejemplo')
  }),

};


describe('ReportesComponent', () => {
  let component: ReportesComponent;
  let fixture: ComponentFixture<ReportesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesComponent],
      providers: [
        { provide: ContratacionesService, useValue: mockContratacionesService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and have initial properties', () => {
    expect(component).toBeTruthy();

    // Validar valores iniciales
    expect(component.unpaidContracts).toEqual([]);
    expect(component.unpaidContractscount).toBe(0);
    expect(component.expiringSoonContracts).toEqual([]);
    expect(component.expiringSoonContractsCount).toBe(0);
    expect(component.expiredContracts).toEqual([]);
    expect(component.expiredContractsCount).toBe(0);
    expect(component.pendingContracts).toEqual([]);
    expect(component.pendingContractsCount).toBe(0);
    expect(component.groupedContracts).toEqual([]);
    expect(component.groupedContractsCount).toBe(0);
    expect(component.reporteSeleccionado).toBe('');
    expect(component.reportesFiltrados).toEqual([]);
    expect(component.contratosFiltrados).toEqual([]);
    expect(component.modalVisible).toBe(false);
    expect(component.clienteSeleccionado).toBeNull();
    expect(component.tarjetas).toEqual([]);
  });

  it('should call lifecycle ngOnInit and trigger expected methods', fakeAsync(() => {
    // Espiar los métodos que se llaman en ngOnInit
    const spyUnpaid = spyOn(component, 'getUnpaidContracts').and.callFake(() => { });
    const spyExpiring = spyOn(component, 'getContractsExpiringSoon').and.callFake(() => { });
    const spyExpired = spyOn(component, 'getExpiredContracts').and.callFake(() => { });
    const spyPending = spyOn(component, 'getPendingContracts').and.callFake(() => { });
    const spyGrouped = spyOn(component, 'getContractsGroupedByClient').and.callFake(() => { });
    const spyVistaPrevia = spyOn(component, 'cargarVistaPrevia').and.callFake(() => { });

    component.ngOnInit();

    expect(spyUnpaid).toHaveBeenCalled();
    expect(spyExpiring).toHaveBeenCalled();
    expect(spyExpired).toHaveBeenCalled();
    expect(spyPending).toHaveBeenCalled();
    expect(spyGrouped).toHaveBeenCalled();

    // Simular paso de 500 ms para que se dispare setTimeout
    tick(500);
    expect(spyVistaPrevia).toHaveBeenCalled();
  }));

  it('should cargarVistaPrevia set contratosFiltrados correctly', () => {
    // Preparar los arrays con datos simulados
    component.unpaidContracts = [{ id: 1 }, { id: 2 }, { id: 3 }] as any;
    component.expiringSoonContracts = [{ id: 4 }, { id: 5 }, { id: 6 }] as any;
    component.expiredContracts = [{ id: 7 }, { id: 8 }, { id: 9 }] as any;
    component.pendingContracts = [{ id: 10 }, { id: 11 }, { id: 12 }] as any;

    component.cargarVistaPrevia();

    expect(component.contratosFiltrados.length).toBe(8); // 2 de cada arreglo
    expect(component.contratosFiltrados).toEqual([
      { id: 1 }, { id: 2 },
      { id: 4 }, { id: 5 },
      { id: 7 }, { id: 8 },
      { id: 10 }, { id: 11 }
    ]);
  });

  describe('seleccionarTarjeta', () => {
    beforeEach(() => {
      // Inicializamos propiedades para pruebas
      component.unpaidContracts = mockUnpaidContracts as any;
      component.expiringSoonContracts = mockExpiringSoonContracts as any;
      component.expiredContracts = mockExpiredContracts as any;
      component.pendingContracts = mockPendingContracts as any;
      component.groupedContracts = mockGroupedContracts as any;
    });

    it('debería deseleccionar la tarjeta si es la misma seleccionada y resetear estados', () => {
      component.reporteSeleccionado = 'Seguros Impagos';

      component.seleccionarTarjeta({ titulo: 'Seguros Impagos' });

      expect(component.reporteSeleccionado).toBe('');
      expect(component.modalVisible).toBeFalse();
      expect(component.clienteSeleccionado).toBeNull();
      expect(component.contratosFiltrados.length).toBe(0);
    });

    it('debería seleccionar "Seguros Impagos" y actualizar contratosFiltrados', () => {
      component.seleccionarTarjeta({ titulo: 'Seguros Impagos' });

      expect(component.reporteSeleccionado).toBe('Seguros Impagos');
      expect(component.modalVisible).toBeFalse();
      expect(component.clienteSeleccionado).toBeNull();
      expect(component.contratosFiltrados).toBe(component.unpaidContracts);
    });

    it('debería seleccionar "Contratos por Vencer" y actualizar contratosFiltrados', () => {
      component.seleccionarTarjeta({ titulo: 'Contratos por Vencer' });

      expect(component.reporteSeleccionado).toBe('Contratos por Vencer');
      expect(component.contratosFiltrados).toBe(component.expiringSoonContracts);
    });

    it('debería seleccionar "Contratos Vencidos" y actualizar contratosFiltrados', () => {
      component.seleccionarTarjeta({ titulo: 'Contratos Vencidos' });

      expect(component.reporteSeleccionado).toBe('Contratos Vencidos');
      expect(component.contratosFiltrados).toBe(component.expiredContracts);
    });

    it('debería seleccionar "Solicitudes Pendientes" y actualizar contratosFiltrados', () => {
      component.seleccionarTarjeta({ titulo: 'Solicitudes Pendientes' });

      expect(component.reporteSeleccionado).toBe('Solicitudes Pendientes');
      expect(component.contratosFiltrados).toBe(component.pendingContracts);
    });

    it('debería seleccionar "Contratos por Cliente" y actualizar contratosFiltrados', () => {
      component.seleccionarTarjeta({ titulo: 'Contratos por Cliente' });

      expect(component.reporteSeleccionado).toBe('Contratos por Cliente');
      expect(component.contratosFiltrados).toBe(component.groupedContracts);
    });

    it('debería llamar cargarVistaPrevia en caso default', () => {
      const spyCargarVistaPrevia = spyOn(component, 'cargarVistaPrevia').and.callThrough();

      component.seleccionarTarjeta({ titulo: 'Otro Título' });

      expect(component.reporteSeleccionado).toBe('Otro Título');
      expect(spyCargarVistaPrevia).toHaveBeenCalled();
    });
  });

  describe('Métodos que llaman al servicio', () => {
    it('getUnpaidContracts debe asignar contratos y llamar cargarTarjetas', () => {
      const spyCargarTarjetas = spyOn(component, 'cargarTarjetas').and.callThrough();

      component.getUnpaidContracts();

      expect(mockContratacionesService.getUnpaidContracts).toHaveBeenCalled();
      expect(component.unpaidContracts).toEqual(mockUnpaidContracts);
      expect(component.unpaidContractscount).toBe(mockUnpaidContracts.length);
      expect(spyCargarTarjetas).toHaveBeenCalled();
    });

    it('getContractsExpiringSoon debe asignar contratos y llamar cargarTarjetas', () => {
      const spyCargarTarjetas = spyOn(component, 'cargarTarjetas').and.callThrough();

      component.getContractsExpiringSoon();

      expect(mockContratacionesService.getExpiringSoonContracts).toHaveBeenCalled();
      expect(component.expiringSoonContracts).toEqual(mockExpiringSoonContracts);
      expect(component.expiringSoonContractsCount).toBe(mockExpiringSoonContracts.length);
      expect(spyCargarTarjetas).toHaveBeenCalled();
    });

    it('getExpiredContracts debe asignar contratos y llamar cargarTarjetas', () => {
      const spyCargarTarjetas = spyOn(component, 'cargarTarjetas').and.callThrough();

      component.getExpiredContracts();

      expect(mockContratacionesService.getExpiredContracts).toHaveBeenCalled();
      expect(component.expiredContracts).toEqual(mockExpiredContracts);
      expect(component.expiredContractsCount).toBe(mockExpiredContracts.length);
      expect(spyCargarTarjetas).toHaveBeenCalled();
    });

    it('getPendingContracts debe asignar contratos y llamar cargarTarjetas', () => {
      const spyCargarTarjetas = spyOn(component, 'cargarTarjetas').and.callThrough();

      component.getPendingContracts();

      expect(mockContratacionesService.getPendingContracts).toHaveBeenCalled();
      expect(component.pendingContracts).toEqual(mockPendingContracts);
      expect(component.pendingContractsCount).toBe(mockPendingContracts.length);
      expect(spyCargarTarjetas).toHaveBeenCalled();
    });

    it('getContractsGroupedByClient debe asignar contratos y llamar cargarTarjetas', () => {
      const spyCargarTarjetas = spyOn(component, 'cargarTarjetas').and.callThrough();

      component.getContractsGroupedByClient();

      expect(mockContratacionesService.getContractsGroupedByClient).toHaveBeenCalled();
      expect(component.groupedContracts).toEqual(mockGroupedContracts);
      expect(component.groupedContractsCount).toBe(mockGroupedContracts.length);
      expect(spyCargarTarjetas).toHaveBeenCalled();
    });
  });

  describe('abrirPdfContrato', () => {
    it('debe abrir el PDF del contrato en una nueva ventana', () => {
      const contractId = 'contract1';
      const mockBase64 = btoa('%PDF-1.4 fake content'); // Contenido simulado

      // Espiar window.open
      const windowOpenSpy = spyOn(window, 'open');

      // Sobrescribimos momentáneamente el método del servicio
      mockContratacionesService.getContractPdf = jasmine.createSpy().and.returnValue(
        of({ content: mockBase64 })
      );

      component.abrirPdfContrato(contractId);

      expect(mockContratacionesService.getContractPdf).toHaveBeenCalledWith(contractId);
      expect(windowOpenSpy).toHaveBeenCalled();

      // También podrías verificar el tipo de contenido del blob si deseas (más detallado)
    });
  });
  describe('base64ToBlob', () => {
    it('debe convertir una cadena base64 en un Blob con el tipo correcto', () => {
      const base64 = btoa('Hola mundo');
      const contentType = 'application/pdf';

      const blob = component.base64ToBlob(base64, contentType);

      expect(blob instanceof Blob).toBeTrue();
      expect(blob.type).toBe(contentType);
    });
  });
  describe('abrirModalCliente y cerrarModal', () => {
    it('debería abrir el modal y asignar el cliente', () => {
      const cliente = mockClientContracts[0];

      component.abrirModalCliente(cliente);

      expect(component.modalVisible).toBeTrue();
      expect(component.clienteSeleccionado).toBe(cliente);
    });

    it('debería cerrar el modal y limpiar el cliente seleccionado', () => {
      component.modalVisible = true;
      component.clienteSeleccionado = mockClientContracts[0];

      component.cerrarModal();

      expect(component.modalVisible).toBeFalse();
      expect(component.clienteSeleccionado).toBeNull();
    });
  });

  describe('obtenerClaseEstado', () => {
    it('debería retornar "warning" para estado pendiente', () => {
      expect(component.obtenerClaseEstado('pendiente de pago')).toBe('warning');
    });

    it('debería retornar "danger" para estado urgente', () => {
      expect(component.obtenerClaseEstado('urgente')).toBe('danger');
    });

    it('debería retornar "success" para estado completado', () => {
      expect(component.obtenerClaseEstado('completado')).toBe('success');
    });

    it('debería retornar "info" para estado desconocido', () => {
      expect(component.obtenerClaseEstado('otro')).toBe('info');
    });
  });

  describe('formatFecha', () => {
    it('debería formatear fecha correctamente', () => {
      const fecha = '2024-06-24';
      const resultado = component.formatFecha(fecha);
      expect(typeof resultado).toBe('string');
      expect(resultado).toContain('2024'); // Año debe estar presente
    });

    it('debería retornar "-" si la fecha es null', () => {
      expect(component.formatFecha(null as any)).toBe('-');
    });
  });

  describe('formatStatus', () => {
    it('debería convertir a mayúsculas el estado', () => {
      expect(component.formatStatus('activo')).toBe('ACTIVO');
    });

    it('debería retornar "DESCONOCIDO" si es null o vacío', () => {
      expect(component.formatStatus('')).toBe('DESCONOCIDO');
      expect(component.formatStatus(null as any)).toBe('DESCONOCIDO');
    });
  });

  describe('formatBeneficiaries', () => {
    it('debería devolver nombres de beneficiarios separados por coma', () => {
      const beneficiarios = [
        { name: 'Carlos' },
        { name: 'María' },
        { name: 'Lucía' }
      ];
      expect(component.formatBeneficiaries(beneficiarios)).toBe('Carlos, María, Lucía');
    });

    it('debería retornar "-" si no hay beneficiarios', () => {
      expect(component.formatBeneficiaries([])).toBe('-');
      expect(component.formatBeneficiaries(null as any)).toBe('-');
    });
  });


});
