import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { ContratacionSegurosComponent } from './contratacion-seguros.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { SegurosService } from '../service/seguros.service';
import { ClientsService } from '../../core/services/clients.service';
import { ContratacionesService } from '../../core/services/contrataciones.service';
import { Insurance, PaymentPeriod, InsuranceType } from '../../shared/interfaces/insurance';
import { Client } from '../../shared/interfaces/client';

describe('ContratacionSegurosComponent', () => {
  let component: ContratacionSegurosComponent;
  let fixture: ComponentFixture<ContratacionSegurosComponent>;
  let segurosServiceSpy: jasmine.SpyObj<SegurosService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let clientsServiceSpy: jasmine.SpyObj<ClientsService>;
  let contratacionesServiceSpy: jasmine.SpyObj<ContratacionesService>;

  beforeEach(waitForAsync(() => {
    const segurosSpy = jasmine.createSpyObj('SegurosService', ['getAll']);
    const messageSpy = jasmine.createSpyObj('MessageService', ['add']);
    const clientsSpy = jasmine.createSpyObj('ClientsService', ['getByIdentificationNumber']);
    const contratacionesSpy = jasmine.createSpyObj('ContratacionesService', ['saveSignature', 'create', 'savePayment', 'uploadDocuments', 'saveBeneficiaries']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ContratacionSegurosComponent],
      providers: [
        FormBuilder,
        { provide: SegurosService, useValue: segurosSpy },
        { provide: MessageService, useValue: messageSpy },
        { provide: ClientsService, useValue: clientsSpy },
        { provide: ContratacionesService, useValue: contratacionesSpy }
      ]
    }).compileComponents();

    segurosServiceSpy = TestBed.inject(SegurosService) as jasmine.SpyObj<SegurosService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    clientsServiceSpy = TestBed.inject(ClientsService) as jasmine.SpyObj<ClientsService>;
    contratacionesServiceSpy = TestBed.inject(ContratacionesService) as jasmine.SpyObj<ContratacionesService>;

    fixture = TestBed.createComponent(ContratacionSegurosComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }));

  it('should create component and load seguros', () => {
    const mockTipos: Insurance[] = [{
      id: '1',
      name: 'Seguro A',
      paymentPeriod: PaymentPeriod.MONTHLY,
      paymentAmount: 100,
      type: InsuranceType.LIFE,
      description: 'Descripción del seguro',
      coverage: 10000,
      deductible: 500,
      active: true
    }];

    segurosServiceSpy.getAll.and.returnValue(of(mockTipos));

    component.cargarTiposSeguro();

    expect(segurosServiceSpy.getAll).toHaveBeenCalled();
    expect(component.tiposSeguro).toEqual(mockTipos);
  });

  it('should return label for tipoPago', () => {
    component.pagoForm.get('tipoPago')?.setValue('efectivo');
    expect(component.getLabelTipoPago()).toBe('Efectivo');

    component.pagoForm.get('tipoPago')?.setValue('tarjeta');
    expect(component.getLabelTipoPago()).toBe('Tarjeta de Crédito');

    component.pagoForm.get('tipoPago')?.setValue('no-existe');
    expect(component.getLabelTipoPago()).toBe('-');
  });

  it('should translate period correctly', () => {
    expect(component.traducirPeriodo('MONTHLY')).toBe('Mensual');
    expect(component.traducirPeriodo('YEARLY')).toBe('Anual');
    expect(component.traducirPeriodo('WEEKLY')).toBe('WEEKLY');
  });

  it('should add and remove beneficiarios', () => {
    const initialLength = component.beneficiarios.length;
    component.agregarBeneficiario();
    expect(component.beneficiarios.length).toBe(initialLength + 1);

    const benefToRemove = component.beneficiarios[0];
    component.eliminarBeneficiario(benefToRemove);
    expect(component.beneficiarios).not.toContain(benefToRemove);
  });

  it('should format date correctly', () => {
    const date = new Date(2025, 4, 21); // May 21, 2025
    expect(component.formatoFecha(date)).toBe('2025-05-21');
    expect(component.formatoFecha(null)).toBeNull();
  });

  it('should show warning message if forms invalid on finalizarProceso', fakeAsync(() => {
    component.clienteForm.setErrors({ required: true }); // Simula error
    component.finalizarProceso();
    tick();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'warn' }));
  }));

  it('should show warning if no files uploaded', fakeAsync(() => {
    component.clienteForm.setErrors(null);
    component.coberturasForm.setErrors(null);
    component.pagoForm.setErrors(null);
    component.documentosForm.setErrors(null);

    component.uploadedFiles = [];
    component.finalizarProceso();
    tick();

    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'warn',
      detail: 'Debe subir al menos un documento.'
    }));
  }));

  it('should call services on successful finalizarProceso', fakeAsync(async () => {
    component.clienteForm.patchValue({ cedula: '0102030405' });
    component.coberturasForm.patchValue({ fechaInicio: new Date(), tipoSeguro: { id: 1, paymentAmount: 100 } });
    component.pagoForm.patchValue({ monto: 100, tipoPago: 'efectivo', fechaPago: new Date() });
    component.documentosForm.setErrors(null);
    component.uploadedFiles = [new File(['content'], 'doc.pdf')];

    const clientData: Client = {
      id: '123',
      identificationNumber: '0102030405',
      name: 'John',
      lastName: 'Doe',
      birthDate: '2000-01-01',
      gender: 'M',
      phoneNumber: 123456789,
      user: {
        id: 'u001',
        name: 'John User',
        email: 'john@example.com',
        rol: 'admin',
        active: true
      },
      address: 'address',
      occupation: 'dev',
      active: true
    };

    clientsServiceSpy.getByIdentificationNumber.and.returnValue(of(clientData));
    contratacionesServiceSpy.saveSignature.and.returnValue(of({}));
    contratacionesServiceSpy.create.and.returnValue(of({ id: 'contract-1' }));
    contratacionesServiceSpy.savePayment.and.returnValue(of({}));
    contratacionesServiceSpy.uploadDocuments.and.returnValue(of({}));
    contratacionesServiceSpy.saveBeneficiaries.and.returnValue(of({}));

    await component.finalizarProceso();

    expect(clientsServiceSpy.getByIdentificationNumber).toHaveBeenCalledWith('0102030405');
    expect(contratacionesServiceSpy.saveSignature).toHaveBeenCalled();
    expect(contratacionesServiceSpy.create).toHaveBeenCalled();
    expect(contratacionesServiceSpy.savePayment).toHaveBeenCalled();
    expect(contratacionesServiceSpy.uploadDocuments).toHaveBeenCalled();
    expect(contratacionesServiceSpy.saveBeneficiaries).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  }));

  it('should handle error on finalizarProceso', fakeAsync(async () => {
    component.clienteForm.patchValue({ cedula: '0102030405' });
    component.coberturasForm.patchValue({ fechaInicio: new Date(), tipoSeguro: { id: 1 } });
    component.pagoForm.patchValue({ monto: 100, tipoPago: 'efectivo', fechaPago: new Date() });
    component.documentosForm.setErrors(null);
    component.uploadedFiles = [new File(['content'], 'doc.pdf')];

    clientsServiceSpy.getByIdentificationNumber.and.returnValue(throwError(() => new Error('fail')));

    await component.finalizarProceso();

    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  }));

  it('should buscarCliente show error if cedula length less than 10', () => {
    component.clienteForm.get('buscar')?.setValue('123');
    component.buscarCliente();

    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });

  it('should reset all forms and related properties when resetForms is called', () => {
    component.clienteForm.patchValue({ cedula: '0102030405' });
    component.coberturasForm.patchValue({ fechaInicio: new Date(), tipoSeguro: { id: 1 } });
    component.pagoForm.patchValue({ monto: 100, tipoPago: 'efectivo', fechaPago: new Date() });
    component.documentosForm.patchValue({ documento: 'test' });

    component.beneficiarios = [
      { nombre: 'Juan', parentesco: 'Hijo', porcentaje: 100 }
    ];

    component.uploadedFiles = [new File(['test'], 'test.pdf')];

    component.resetForms();

    expect(component.clienteForm.pristine).toBeTrue();
    expect(component.clienteForm.untouched).toBeTrue();
    expect(component.clienteForm.value).toEqual(jasmine.objectContaining({ cedula: null }));

    expect(component.coberturasForm.value).toEqual(jasmine.objectContaining({ fechaInicio: null, tipoSeguro: null }));
    expect(component.pagoForm.value).toEqual(jasmine.objectContaining({ monto: null, tipoPago: null, fechaPago: null }));
    expect(component.documentosForm.value).toEqual(jasmine.objectContaining({ documento: null }));

    expect(component.beneficiarios.length).toBe(0);
    expect(component.uploadedFiles.length).toBe(0);
  });
});
