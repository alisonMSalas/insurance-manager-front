import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MainRevisionComponent } from './main-revision.component';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { AccordionModule } from 'primeng/accordion';
import { DocumentacionComponent } from '../documentacion/documentacion.component';
import { ResumenComponent } from '../resumen/resumen.component';
import { PaymentsComponent } from '../payments/payments.component';
import { ContratacionesService } from '../../../core/services/contrataciones.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { Contract } from '../../../shared/interfaces/contract';
import { Attachment, AttachmentType } from '../../../shared/interfaces/attachment';
import { InsuranceType, PaymentPeriod } from '../../../shared/interfaces/insurance';
import { ContractStep } from '../../../shared/interfaces/contract-step';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('MainRevisionComponent (integración)', () => {
  let component: MainRevisionComponent;
  let fixture: ComponentFixture<MainRevisionComponent>;
  let mockContratacionesService: jasmine.SpyObj<ContratacionesService>;
  let mockActivatedRoute: { snapshot: { paramMap: { get: jasmine.Spy } } };
  let mockContratoIdSubject: BehaviorSubject<string>;

  const mockContract: Contract = {
    id: '123',
    clientId: 'client456',
    clientAttachments: [
      {
        content: 'base64data',
        fileName: 'test.jpg',
        attachmentType: AttachmentType.PORTRAIT_PHOTO,
      },
      {
        content: 'base64data2',
        fileName: 'document.pdf',
        attachmentType: AttachmentType.IDENTIFICATION,
      }
    ],
    startDate: '2025-06-12',
    status: 'ACTIVE',
    totalPaymentAmount: 1000,
    insuranceId: 'ins789',
    active: true,
    client: {
      id: 'client456',
      name: 'John',
      lastName: 'Doe',
      identificationNumber: '123456789',
      birthDate: '1990-01-01',
      phoneNumber: '123-456-7890',
      address: '123 Main St, City',
      gender: 'Male',
      occupation: 'Engineer',
      active: true,
      user: {
        id: 'user123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        rol: 'CLIENT',
        active: true,
      },
    },
    insurance: {
      id: 'ins789',
      name: 'Seguro de Vida',
      type: InsuranceType.LIFE,
      description: 'Cubre gastos médicos y de vida',
      coverage: 100000,
      deductible: 500,
      paymentAmount: 100,
      paymentPeriod: PaymentPeriod.MONTHLY,
      active: true,
      benefits: [
        {
          id: 'ben1',
          name: 'Cobertura Básica',
          description: 'Cubre gastos médicos básicos',
        },
      ],
    },
    beneficiaries: [
      {
        name: 'Jane',
        lastName: 'Doe',
        identificationNumber: '987654321',
        relationship: 'Esposa',
        phoneNumber: '987-654-3210',
      },
    ],
    contractFile: 'contract.pdf',
    stepStatuses: {
      [ContractStep.UPLOAD_DOCUMENTS]: true,
      [ContractStep.DOCUMENT_APPROVAL]: false,
      [ContractStep.PAYMENT_APPROVAL]: false,
      [ContractStep.CLIENT_APPROVAL]: false,
    },
  };

  beforeEach(async () => {
    mockContratoIdSubject = new BehaviorSubject<string>('123');
    
    mockContratacionesService = jasmine.createSpyObj('ContratacionesService', ['getById'], {
      contratoId$: mockContratoIdSubject.asObservable(),
    });

    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get'),
        },
      },
    };

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ButtonModule,
        RouterLink,
        AccordionModule,
        DocumentacionComponent,
        ResumenComponent,
        PaymentsComponent,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: ContratacionesService, useValue: mockContratacionesService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideNoopAnimations()
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MainRevisionComponent);
    component = fixture.componentInstance;
  });

  it('debe inicializar con valores por defecto', () => {
    expect(component.contractInfo).toBeNull();
    expect(component.contratoId).toBe('');
    expect(component.clientId).toBe('');
    expect(component.esDesdeRuta).toBeFalse();
    expect(component.attatchments).toEqual([]);
  });

  it('debe crear el componente correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar contrato desde la ruta cuando hay idFromRoute', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(of(mockContract));

    component.ngOnInit();
    fixture.detectChanges();

    expect(mockActivatedRoute.snapshot.paramMap.get).toHaveBeenCalledWith('id');
    expect(component.contratoId).toBe('123');
    expect(component.esDesdeRuta).toBeTrue();
    expect(mockContratacionesService.getById).toHaveBeenCalledWith('123');
    expect(component.contractInfo).toEqual(mockContract);
    expect(component.clientId).toBe('client456');
    expect(component.attatchments).toEqual(mockContract.clientAttachments || []);
  });

  it('debe suscribirse a contratoId$ cuando no hay idFromRoute', fakeAsync(() => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);
    mockContratacionesService.getById.and.returnValue(of(mockContract));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.contratoId).toBe('123');
    expect(component.esDesdeRuta).toBeFalse();
    expect(mockContratacionesService.getById).toHaveBeenCalledWith('123');
    expect(component.contractInfo).toEqual(mockContract);
    expect(component.clientId).toBe('client456');
    expect(component.attatchments).toEqual(mockContract.clientAttachments || []);
  }));

  it('debe manejar cambios en contratoId$ correctamente', fakeAsync(() => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);
    mockContratacionesService.getById.and.returnValue(of(mockContract));

    component.ngOnInit();
    tick();

    // Cambiar el contratoId
    mockContratoIdSubject.next('456');
    tick();

    expect(mockContratacionesService.getById).toHaveBeenCalledWith('456');
  }));

  it('debe manejar error al cargar contrato desde ruta', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(throwError(() => new Error('Error al cargar contrato')));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.contractInfo).toBeNull();
    expect(component.clientId).toBe('');
    expect(component.attatchments).toEqual([]);
  });

  it('debe manejar error al cargar contrato desde suscripción', fakeAsync(() => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);
    mockContratacionesService.getById.and.returnValue(throwError(() => new Error('Error al cargar contrato')));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.contractInfo).toBeNull();
    expect(component.clientId).toBe('');
    expect(component.attatchments).toEqual([]);
  }));

  it('debe manejar contrato sin clientId', () => {
    const contractWithoutClientId = { ...mockContract, clientId: undefined };
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(of(contractWithoutClientId));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.clientId).toBe('');
  });

  it('debe manejar contrato sin clientAttachments', () => {
    const contractWithoutAttachments = { ...mockContract, clientAttachments: undefined };
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(of(contractWithoutAttachments));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.attatchments).toEqual([]);
  });

  it('debe manejar contrato con clientAttachments vacío', () => {
    const contractWithEmptyAttachments = { ...mockContract, clientAttachments: [] };
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(of(contractWithEmptyAttachments));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.attatchments).toEqual([]);
  });

  it('debe manejar contratoId vacío en la suscripción', fakeAsync(() => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);
    mockContratacionesService.getById.and.returnValue(of(mockContract));

    component.ngOnInit();
    tick();

    // Emitir contratoId vacío
    mockContratoIdSubject.next('');
    tick();

    expect(mockContratacionesService.getById).toHaveBeenCalledWith('');
  }));

  it('debe desuscribirse correctamente en ngOnDestroy', fakeAsync(() => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue(null);
    mockContratacionesService.getById.and.returnValue(of(mockContract));

    component.ngOnInit();
    tick();

    expect(() => component.ngOnDestroy()).not.toThrow();
  }));

  it('debe manejar ngOnDestroy sin suscripción', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(of(mockContract));

    component.ngOnInit();

    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it('debe manejar múltiples llamadas a cargarContrato', () => {
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(of(mockContract));

    component.ngOnInit();
    fixture.detectChanges();

    // Llamar cargarContrato nuevamente
    (component as any).cargarContrato('789');
    fixture.detectChanges();

    expect(mockContratacionesService.getById).toHaveBeenCalledWith('789');
  });

  it('debe manejar contrato con stepStatuses completos', () => {
    const contractWithCompleteSteps = {
      ...mockContract,
      stepStatuses: {
        [ContractStep.UPLOAD_DOCUMENTS]: true,
        [ContractStep.DOCUMENT_APPROVAL]: true,
        [ContractStep.PAYMENT_APPROVAL]: true,
        [ContractStep.CLIENT_APPROVAL]: true,
      }
    };

    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(of(contractWithCompleteSteps));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.contractInfo).toEqual(contractWithCompleteSteps);
  });

  it('debe manejar contrato con stepStatuses parciales', () => {
    const contractWithPartialSteps = {
      ...mockContract,
      stepStatuses: {
        [ContractStep.UPLOAD_DOCUMENTS]: true,
        [ContractStep.DOCUMENT_APPROVAL]: false,
        [ContractStep.PAYMENT_APPROVAL]: true,
        [ContractStep.CLIENT_APPROVAL]: false,
      }
    };

    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(of(contractWithPartialSteps));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.contractInfo).toEqual(contractWithPartialSteps);
  });

  it('debe manejar contrato sin stepStatuses', () => {
    const contractWithoutSteps = { ...mockContract };
    delete contractWithoutSteps.stepStatuses;

    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(of(contractWithoutSteps));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.contractInfo).toEqual(contractWithoutSteps);
  });

  it('debe manejar contrato con diferentes tipos de attachments', () => {
    const contractWithDifferentAttachments = {
      ...mockContract,
      clientAttachments: [
        {
          content: 'base64data1',
          fileName: 'identificacion.pdf',
          attachmentType: AttachmentType.IDENTIFICATION,
        },
        {
          content: 'base64data2',
          fileName: 'foto.jpg',
          attachmentType: AttachmentType.PORTRAIT_PHOTO,
        }
      ]
    };

    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(of(contractWithDifferentAttachments));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.attatchments).toEqual(contractWithDifferentAttachments.clientAttachments);
    expect(component.attatchments.length).toBe(2);
  });

  it('debe manejar contrato con status inactivo', () => {
    const inactiveContract = { ...mockContract, active: false };
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(of(inactiveContract));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.contractInfo).toEqual(inactiveContract);
    expect(component.contractInfo?.active).toBeFalse();
  });

  it('debe manejar contrato con diferentes status', () => {
    const pendingContract = { ...mockContract, status: 'PENDING' };
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(of(pendingContract));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.contractInfo?.status).toBe('PENDING');
  });

  it('debe manejar contrato con diferentes fechas de inicio', () => {
    const futureContract = { ...mockContract, startDate: '2025-12-31' };
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(of(futureContract));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.contractInfo?.startDate).toBe('2025-12-31');
  });

  it('debe manejar contrato con diferentes montos de pago', () => {
    const highAmountContract = { ...mockContract, totalPaymentAmount: 5000 };
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(of(highAmountContract));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.contractInfo?.totalPaymentAmount).toBe(5000);
  });

  it('debe manejar contrato sin archivo de contrato', () => {
    const contractWithoutFile = { ...mockContract };
    delete contractWithoutFile.contractFile;

    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(of(contractWithoutFile));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.contractInfo).toEqual(contractWithoutFile);
  });

  it('debe manejar contrato sin beneficiarios', () => {
    const contractWithoutBeneficiaries = { ...mockContract, beneficiaries: [] };
    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(of(contractWithoutBeneficiaries));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.contractInfo?.beneficiaries).toEqual([]);
  });

  it('debe manejar contrato con múltiples beneficiarios', () => {
    const contractWithMultipleBeneficiaries = {
      ...mockContract,
      beneficiaries: [
        {
          name: 'Jane',
          lastName: 'Doe',
          identificationNumber: '987654321',
          relationship: 'Esposa',
          phoneNumber: '987-654-3210',
        },
        {
          name: 'John',
          lastName: 'Smith',
          identificationNumber: '123123123',
          relationship: 'Hijo',
          phoneNumber: '123-123-1234',
        }
      ]
    };

    mockActivatedRoute.snapshot.paramMap.get.and.returnValue('123');
    mockContratacionesService.getById.and.returnValue(of(contractWithMultipleBeneficiaries));

    component.ngOnInit();
    fixture.detectChanges();

    expect(component.contractInfo?.beneficiaries?.length).toBe(2);
  });
});