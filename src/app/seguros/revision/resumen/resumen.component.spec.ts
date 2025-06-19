import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ResumenComponent } from './resumen.component';
import { ContratacionesService } from '../../../core/services/contrataciones.service';
import { SegurosService } from '../../service/seguros.service';
import { Contract } from '../../../shared/interfaces/contract';
import { Insurance, InsuranceType, PaymentPeriod } from '../../../shared/interfaces/insurance';
import { Client } from '../../../shared/interfaces/client';
import { User } from '../../../core/services/users.service';
import { ContractStep } from '../../../shared/interfaces/contract-step';

describe('ResumenComponent', () => {
  let component: ResumenComponent;
  let fixture: ComponentFixture<ResumenComponent>;
  let mockContratacionesService: jasmine.SpyObj<ContratacionesService>;
  let mockSegurosService: jasmine.SpyObj<SegurosService>;

  const mockUser: User = {
    id: 'u1',
    name: 'Test User',
    email: 'test@example.com',
    rol: 'ADMIN',
    active: true
  };

  const mockClient: Client = {
    id: 'client-1',
    name: 'Ana',
    lastName: 'Pérez',
    identificationNumber: '1234567890',
    birthDate: '1990-01-01',
    phoneNumber: '0987654321',
    address: 'Calle 1',
    gender: 'F',
    occupation: 'Ingeniera',
    active: true,
    user: mockUser
  };

  const mockInsurance: Insurance & { benefits: { id: string; name: string; description: string; }[] } = {
    id: 'insurance-1',
    name: 'Seguro Healthy FRAM',
    type: InsuranceType.HEALTH,
    description: 'Cobertura completa',
    coverage: 50000,
    deductible: 200,
    paymentAmount: 120,
    paymentPeriod: PaymentPeriod.MONTHLY,
    active: true,
    benefits: [
      { id: 'b1', name: 'Beneficio 1', description: 'Desc 1' },
      { id: 'b2', name: 'Beneficio 2', description: 'Desc 2' }
    ]
  };

  const mockContract: Contract = {
    id: '1',
    startDate: '2025-06-01',
    insuranceId: 'insurance-1',
    clientId: 'client-1',
    active: true,
    status: 'ACTIVE',
    insurance: mockInsurance,
    client: mockClient,
    beneficiaries: [],
    clientAttachments: [],
    contractFile: '',
    stepStatuses: {
      [ContractStep.UPLOAD_DOCUMENTS]: true,
      [ContractStep.DOCUMENT_APPROVAL]: true,
      [ContractStep.PAYMENT_APPROVAL]: false,
      [ContractStep.CLIENT_APPROVAL]: false
    },
    totalPaymentAmount: 1000
  };

  beforeEach(async () => {
    mockContratacionesService = jasmine.createSpyObj('ContratacionesService', ['getById']);
    mockSegurosService = jasmine.createSpyObj('SegurosService', ['getById']);

    await TestBed.configureTestingModule({
      imports: [ResumenComponent],
      providers: [
        { provide: ContratacionesService, useValue: mockContratacionesService },
        { provide: SegurosService, useValue: mockSegurosService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResumenComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar advertencia si no hay contratoId', () => {
    spyOn(console, 'warn');
    component.contratoId = '';
    component.getContractById();
    expect(console.warn).toHaveBeenCalledWith('No se recibió contratoId como @Input');
  });

  it('debe obtener contrato y asignar datos correctamente', fakeAsync(() => {
    mockContratacionesService.getById.and.returnValue(of(mockContract));
    component.contratoId = '1';
    component.getContractById();
    tick();
    expect(mockContratacionesService.getById).toHaveBeenCalledWith('1');
    expect(component.contract).toEqual(mockContract!);
    expect(component.policy).toEqual(mockContract.insurance!);
    expect(component.client).toEqual(mockContract.client!);
    expect(component.benefits).toEqual(mockContract.insurance!.benefits);
  }));

  it('debe manejar error al obtener contrato', fakeAsync(() => {
    spyOn(console, 'error');
    mockContratacionesService.getById.and.returnValue(throwError(() => new Error('Error de prueba')));
    component.contratoId = '1';
    component.getContractById();
    tick();
    expect(console.error).toHaveBeenCalledWith('Error al obtener el contrato:', jasmine.any(Error));
  }));

  it('debe ejecutar getContractById en ngOnInit', fakeAsync(() => {
    spyOn(component, 'getContractById');
    component.ngOnInit();
    expect(component.getContractById).toHaveBeenCalled();
  }));

  describe('getStatusClass', () => {
    it('debe retornar la clase correcta para cada estado', () => {
      expect(component.getStatusClass('ACTIVE')).toBe('active');
      expect(component.getStatusClass('PENDING')).toBe('pending');
      expect(component.getStatusClass('CANCELLED')).toBe('cancelled');
      expect(component.getStatusClass('REJECTED_BY_CLIENT')).toBe('rejected');
      expect(component.getStatusClass('EXPIRED')).toBe('expired');
      expect(component.getStatusClass('OTRO')).toBe('');
      expect(component.getStatusClass(undefined)).toBe('');
    });
  });

  describe('getRolName', () => {
    it('debe retornar el nombre correcto para cada rol', () => {
      expect(component.getRolName('CLIENT')).toBe('Cliente');
      expect(component.getRolName('ADMIN')).toBe('Administrador');
      expect(component.getRolName('AGENT')).toBe('Agente');
      expect(component.getRolName('OTRO')).toBe('OTRO');
    });
  });

  describe('getPolicyTypeName', () => {
    it('debe retornar el nombre correcto para cada tipo de póliza', () => {
      expect(component.getPolicyTypeName('HEALTH')).toBe('Salud');
      expect(component.getPolicyTypeName('LIFE')).toBe('Vida');
      expect(component.getPolicyTypeName('AUTO')).toBe('Auto');
      expect(component.getPolicyTypeName('OTRO')).toBe('OTRO');
    });
  });

  describe('getPaymentPeriodName', () => {
    it('debe retornar el nombre correcto para cada periodo de pago', () => {
      expect(component.getPaymentPeriodName('MONTHLY')).toBe('Mensual');
      expect(component.getPaymentPeriodName('QUARTERLY')).toBe('Trimestral');
      expect(component.getPaymentPeriodName('YEARLY')).toBe('Anual');
      expect(component.getPaymentPeriodName('OTRO')).toBe('OTRO');
    });
  });
});
