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
import { of, throwError } from 'rxjs';
import { Contract } from '../../../shared/interfaces/contract';
import { Attachment, AttachmentType } from '../../../shared/interfaces/attachment';
import {  InsuranceType, PaymentPeriod } from '../../../shared/interfaces/insurance';
import { ContractStep } from '../../../shared/interfaces/contract-step';

describe('MainRevisionComponent', () => {
  let component: MainRevisionComponent;
  let fixture: ComponentFixture<MainRevisionComponent>;
  let contratacionesServiceSpy: jasmine.SpyObj<ContratacionesService>;
  let activatedRouteSpy: { snapshot: { paramMap: { get: jasmine.Spy } } };

  const mockContract: Contract = {
    id: '123',
    clientId: 'client456',
    clientAttachments: [
      {
        content: 'base64data',
        fileName: 'test.jpg',
        attachmentType: AttachmentType.PORTRAIT_PHOTO,
      },
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
    // Crear spies para los servicios
    contratacionesServiceSpy = jasmine.createSpyObj('ContratacionesService', ['getById'], {
      contratoId$: of('123'),
    });

    // Configurar el mock de ActivatedRoute correctamente
    activatedRouteSpy = {
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
      ],
      providers: [
        { provide: ContratacionesService, useValue: contratacionesServiceSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
      ],
      declarations: [MainRevisionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MainRevisionComponent);
    component = fixture.componentInstance;
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('debería cargar el contrato desde la ruta si idFromRoute está presente', () => {
      activatedRouteSpy.snapshot.paramMap.get.and.returnValue('123');
      contratacionesServiceSpy.getById.and.returnValue(of(mockContract));

      component.ngOnInit();
      fixture.detectChanges();

      expect(activatedRouteSpy.snapshot.paramMap.get).toHaveBeenCalledWith('id');
      expect(component.contratoId).toBe('123');
      expect(component.esDesdeRuta).toBeTrue();
      expect(contratacionesServiceSpy.getById).toHaveBeenCalledWith('123');
      expect(component.contractInfo).toEqual(mockContract);
      expect(component.clientId).toBe('client456');
      expect(component.attatchments).toEqual(mockContract.clientAttachments!);
    });

    it('debería suscribirse a contratoId$ si no hay idFromRoute', fakeAsync(() => {
      activatedRouteSpy.snapshot.paramMap.get.and.returnValue(null);
      contratacionesServiceSpy.getById.and.returnValue(of(mockContract));

      component.ngOnInit();
      tick();
      fixture.detectChanges();

      expect(component.contratoId).toBe('123');
      expect(component.esDesdeRuta).toBeFalse();
      expect(contratacionesServiceSpy.getById).toHaveBeenCalledWith('123');
      expect(component.contractInfo).toEqual(mockContract);
      expect(component.clientId).toBe('client456');
      expect(component.attatchments).toEqual(mockContract.clientAttachments!);
    }));

    it('debería manejar errores al cargar el contrato', () => {
      activatedRouteSpy.snapshot.paramMap.get.and.returnValue('123');
      contratacionesServiceSpy.getById.and.returnValue(throwError(() => new Error('Error al cargar contrato')));

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.contractInfo).toBeNull();
      expect(component.clientId).toBe('');
      expect(component.attatchments).toEqual([]);
    });
  });

  describe('ngOnDestroy', () => {
    it('debería desuscribirse del observable si se creó una suscripción', fakeAsync(() => {
      activatedRouteSpy.snapshot.paramMap.get.and.returnValue(null); // Forzar suscripción
      contratacionesServiceSpy.getById.and.returnValue(of(mockContract));

      component.ngOnInit();
      tick();

      // No accedemos directamente a subscription; verificamos que no haya errores
      expect(() => component.ngOnDestroy()).not.toThrow();
    }));

    it('no debería lanzar errores si no hay suscripción', () => {
      activatedRouteSpy.snapshot.paramMap.get.and.returnValue('123'); // Sin suscripción
      contratacionesServiceSpy.getById.and.returnValue(of(mockContract));

      component.ngOnInit();

      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('cargarContrato', () => {
    it('debería cargar la información del contrato correctamente', () => {
      contratacionesServiceSpy.getById.and.returnValue(of(mockContract));

      // Acceso al método privado para pruebas
      (component as any).cargarContrato('123');

      expect(contratacionesServiceSpy.getById).toHaveBeenCalledWith('123');
      expect(component.contractInfo).toEqual(mockContract);
      expect(component.clientId).toBe('client456');
      expect(component.attatchments).toEqual(mockContract.clientAttachments!);
    });

    it('debería manejar errores al cargar el contrato', () => {
      contratacionesServiceSpy.getById.and.returnValue(throwError(() => new Error('Error al cargar contrato')));

      (component as any).cargarContrato('123');

      expect(component.contractInfo).toBeNull();
      expect(component.clientId).toBe('');
      expect(component.attatchments).toEqual([]);
    });
  });
});