import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PaymentsComponent } from './payments.component';
import { ContratacionesService } from '../../../core/services/contrataciones.service';
import { PaymentsService } from '../../service/payments.service';
import { Contract } from '../../../shared/interfaces/contract';
import { Insurance, InsuranceType, PaymentPeriod } from '../../../shared/interfaces/insurance';
import { Client } from '../../../shared/interfaces/client';
import { User } from '../../../core/services/users.service';
import { ContractStep } from '../../../shared/interfaces/contract-step';
import { PaymentUrl } from '../../../shared/interfaces/payment-url-dto';

describe('PaymentsComponent', () => {
  let component: PaymentsComponent;
  let fixture: ComponentFixture<PaymentsComponent>;
  let mockContratacionesService: jasmine.SpyObj<ContratacionesService>;
  let mockPaymentsService: jasmine.SpyObj<PaymentsService>;

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

  const mockPaymentUrl: PaymentUrl = {
    url: 'https://checkout.stripe.com/pay/cs_test_123'
  };

  beforeEach(async () => {
    mockContratacionesService = jasmine.createSpyObj('ContratacionesService', ['getById']);
    mockPaymentsService = jasmine.createSpyObj('PaymentsService', ['createCheckoutSession']);

    await TestBed.configureTestingModule({
      imports: [PaymentsComponent],
      providers: [
        { provide: ContratacionesService, useValue: mockContratacionesService },
        { provide: PaymentsService, useValue: mockPaymentsService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentsComponent);
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

  it('debe manejar pago exitoso desde query params', fakeAsync(() => {
    // Mock URLSearchParams
    const mockUrlParams = new URLSearchParams('?pago=exitoso');
    spyOn(window, 'URLSearchParams').and.returnValue(mockUrlParams);
    spyOn(component, 'getContractById');
    
    component.ngOnInit();
    tick(1000); // Esperar el setTimeout
    
    expect(component.getContractById).toHaveBeenCalledTimes(2); // Una vez en ngOnInit y otra en setTimeout
  }));

  it('debe manejar pago no exitoso desde query params', fakeAsync(() => {
    // Mock URLSearchParams sin pago exitoso
    const mockUrlParams = new URLSearchParams('?otro=param');
    spyOn(window, 'URLSearchParams').and.returnValue(mockUrlParams);
    spyOn(component, 'getContractById');
    
    component.ngOnInit();
    tick(1000);
    
    expect(component.getContractById).toHaveBeenCalledTimes(1); // Solo una vez en ngOnInit
  }));

  it('debe manejar query params vacíos', fakeAsync(() => {
    // Mock URLSearchParams vacío
    const mockUrlParams = new URLSearchParams('');
    spyOn(window, 'URLSearchParams').and.returnValue(mockUrlParams);
    spyOn(component, 'getContractById');
    
    component.ngOnInit();
    tick(1000);
    
    expect(component.getContractById).toHaveBeenCalledTimes(1); // Solo una vez en ngOnInit
  }));

  it('debe iniciar pago correctamente', fakeAsync(() => {
    spyOn(localStorage, 'setItem');
    spyOn(window, 'open');
    mockPaymentsService.createCheckoutSession.and.returnValue(of(mockPaymentUrl));
    
    component.contratoId = '1';
    component.iniciarPago();
    tick();
    
    expect(mockPaymentsService.createCheckoutSession).toHaveBeenCalledWith('1');
    expect(localStorage.setItem).toHaveBeenCalledWith('esperandoPago', 'true');
    expect(window.location.href).toBe(mockPaymentUrl.url);
  }));

  it('debe manejar error al iniciar pago', fakeAsync(() => {
    spyOn(console, 'error');
    mockPaymentsService.createCheckoutSession.and.returnValue(throwError(() => new Error('Error de pago')));
    
    component.contratoId = '1';
    component.iniciarPago();
    tick();
    
    expect(console.error).toHaveBeenCalledWith('Error al iniciar sesión de pago', jasmine.any(Error));
  }));

  describe('getStatusClass', () => {
    it('debe retornar clase CSS correcta para estados normales', () => {
      expect(component.getStatusClass('ACTIVE')).toBe('status-active');
      expect(component.getStatusClass('PENDING')).toBe('status-pending');
      expect(component.getStatusClass('CANCELLED')).toBe('status-cancelled');
    });

    it('debe manejar estados con espacios', () => {
      expect(component.getStatusClass('PAYMENT APPROVAL')).toBe('status-payment-approval');
      expect(component.getStatusClass('DOCUMENT APPROVAL')).toBe('status-document-approval');
    });

    it('debe manejar estados con múltiples espacios', () => {
      expect(component.getStatusClass('PAYMENT  APPROVAL')).toBe('status-payment-approval');
      expect(component.getStatusClass('  PENDING  ')).toBe('status-pending');
    });

    it('debe manejar estados en mayúsculas y minúsculas', () => {
      expect(component.getStatusClass('Active')).toBe('status-active');
      expect(component.getStatusClass('PENDING')).toBe('status-pending');
      expect(component.getStatusClass('cancelled')).toBe('status-cancelled');
    });

    it('debe manejar estados con caracteres especiales', () => {
      expect(component.getStatusClass('PAYMENT-APPROVAL')).toBe('status-payment-approval');
      expect(component.getStatusClass('PAYMENT_APPROVAL')).toBe('status-payment_approval');
    });

    it('debe manejar estados vacíos', () => {
      expect(component.getStatusClass('')).toBe('status-');
      expect(component.getStatusClass('   ')).toBe('status-');
    });
  });

  it('debe tener contractStep disponible', () => {
    expect(component.contractStep).toBe(ContractStep);
  });

  it('debe inicializar propiedades correctamente', () => {
    expect(component.contratoId).toBe('');
    expect(component.contract).toBeNull();
    expect(component.policy).toBeNull();
    expect(component.client).toBeNull();
  });

  it('debe manejar contrato sin insurance', fakeAsync(() => {
    const contractWithoutInsurance = { ...mockContract, insurance: undefined };
    mockContratacionesService.getById.and.returnValue(of(contractWithoutInsurance));
    
    component.contratoId = '1';
    component.getContractById();
    tick();
    
    expect(component.contract).toEqual(contractWithoutInsurance);
    expect(component.policy).toBeUndefined();
    expect(component.client).toEqual(mockContract.client!);
  }));

  it('debe manejar contrato sin client', fakeAsync(() => {
    const contractWithoutClient = { ...mockContract, client: undefined };
    mockContratacionesService.getById.and.returnValue(of(contractWithoutClient));
    
    component.contratoId = '1';
    component.getContractById();
    tick();
    
    expect(component.contract).toEqual(contractWithoutClient);
    expect(component.policy).toEqual(mockContract.insurance!);
    expect(component.client).toBeUndefined();
  }));
});
