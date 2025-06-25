import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ListSegurosComponent } from './list-seguros.component';
import { of, throwError } from 'rxjs';
import { SegurosService } from '../service/seguros.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Insurance, InsuranceType, PaymentPeriod } from '../../shared/interfaces/insurance';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Benefit } from '../../shared/interfaces/benefit';
import { PickListMoveToSourceEvent, PickListMoveToTargetEvent } from 'primeng/picklist';


describe('ListSegurosComponent', () => {
  let component: ListSegurosComponent;
  let fixture: ComponentFixture<ListSegurosComponent>;
  let segurosServiceSpy: jasmine.SpyObj<SegurosService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let confirmationService: ConfirmationService;

  const mockInsurances: Insurance[] = [
    { id: '1', name: 'Seguro A', type: InsuranceType.HEALTH, description: '', coverage: 1000, deductible: 200, paymentAmount: 100, paymentPeriod: PaymentPeriod.MONTHLY, active: true },
    { id: '2', name: 'Seguro B', type: InsuranceType.LIFE, description: '', coverage: 2000, deductible: 300, paymentAmount: 150, paymentPeriod: PaymentPeriod.YEARLY, active: false },
  ];

  beforeEach(async () => {
    const segurosSpy = jasmine.createSpyObj('SegurosService', ['getAll', 'updateStatus', 'delete', 'save', 'update', 'getAllBenefits']);
    const messageSpy = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [ListSegurosComponent],
      providers: [
        { provide: SegurosService, useValue: segurosSpy },
        { provide: MessageService, useValue: messageSpy },
        ConfirmationService,
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListSegurosComponent);
    component = fixture.componentInstance;
    segurosServiceSpy = TestBed.inject(SegurosService) as jasmine.SpyObj<SegurosService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    confirmationService = TestBed.inject(ConfirmationService);
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar seguros y aplicar filtros', () => {
    segurosServiceSpy.getAll.and.returnValue(of(mockInsurances));
    component.loadInsurances();
    expect(component.insurances.length).toBe(2);
    expect(component.filteredInsurances.length).toBe(2);
  });

  it('debería manejar error al cargar seguros', () => {
    const error = new HttpErrorResponse({ error: { message: 'Error de servidor' }, status: 500 });
    segurosServiceSpy.getAll.and.returnValue(throwError(() => error));
    component.loadInsurances();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  });

  it('debería filtrar seguros por estado y tipo', () => {
    component.insurances = mockInsurances;
    component.selectedStatus = true;
    component.selectedType = InsuranceType.HEALTH;
    component.applyFilters();
    expect(component.filteredInsurances.length).toBe(1);
  });

  it('debería cambiar estado del seguro', () => {
    const insurance = mockInsurances[0];
    segurosServiceSpy.updateStatus.and.returnValue(of(mockInsurances[0]));

    segurosServiceSpy.getAll.and.returnValue(of(mockInsurances));
    component.changeStatus(insurance);
    expect(segurosServiceSpy.updateStatus).toHaveBeenCalledWith(insurance.id!, false);
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: 'Estado actualizado correctamente' }));
  });

  it('debería eliminar seguro tras confirmación', fakeAsync(() => {
    const insurance = mockInsurances[0];
    segurosServiceSpy.delete.and.returnValue(of(void 0));

    segurosServiceSpy.getAll.and.returnValue(of(mockInsurances));

    spyOn(confirmationService, 'confirm');


    component.deleteInsurance(insurance);
    tick();
    expect(segurosServiceSpy.delete).toHaveBeenCalledWith(insurance.id!);
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: 'Seguro eliminado correctamente' }));
  }));

  it('debería guardar un seguro nuevo', () => {
    segurosServiceSpy.save.and.returnValue(of(mockInsurances[0]));
    segurosServiceSpy.getAll.and.returnValue(of(mockInsurances));
    component.isEditing = false;
    component.saveInsurance();
    expect(segurosServiceSpy.save).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: 'Seguro registrado correctamente' }));
  });

  it('debería actualizar un seguro existente', () => {
    const editedInsurance = { ...mockInsurances[0], name: 'Editado' };
    component.isEditing = true;
    component.currentInsuranceId = editedInsurance.id!;
    component.insurance = { ...editedInsurance };
    segurosServiceSpy.update.and.returnValue(of(editedInsurance));
    segurosServiceSpy.getAll.and.returnValue(of(mockInsurances));
    component.saveInsurance();
    expect(segurosServiceSpy.update).toHaveBeenCalledWith(editedInsurance.id!, editedInsurance);

    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: 'Seguro actualizado correctamente' }));
  });

  it('debería abrir el modal para crear seguro', () => {
    component.openModal();
    expect(component.display).toBeTrue();
    expect(component.isEditing).toBeFalse();
  });

  it('debería abrir el modal para editar seguro', () => {
    const insurance = mockInsurances[0];
    component.openModal(insurance);
    expect(component.display).toBeTrue();
    expect(component.isEditing).toBeTrue();
    expect(component.insurance.name).toBe(insurance.name);
  });

  it('debería resetear campos correctamente', () => {
    component.insurance.name = 'Modificado';
    component.resetCampos();
    expect(component.insurance.name).toBe('');
    expect(component.insurance.coverage).toBe(0);
  });

  it('debería llamar a loadInsurances en ngOnInit', () => {
    spyOn(component, 'loadInsurances');
    component.ngOnInit();
    expect(component.loadInsurances).toHaveBeenCalled();
  });

  it('debería activar loading y llamar a loadInsurances en refreshData', () => {
    spyOn(component, 'loadInsurances');
    component.loading = false;

    component.refreshData();

    expect(component.loading).toBeTrue();
    expect(component.loadInsurances).toHaveBeenCalled();
  });
  it('debería ordenar seguros con mismo estado activo por id usando localeCompare', () => {
    const insurances = [
      { id: 'b', active: true, name: 'Seguro B', type: InsuranceType.LIFE, description: '', coverage: 0, deductible: 0, paymentAmount: 0, paymentPeriod: PaymentPeriod.MONTHLY },
      { id: 'a', active: true, name: 'Seguro A', type: InsuranceType.HEALTH, description: '', coverage: 0, deductible: 0, paymentAmount: 0, paymentPeriod: PaymentPeriod.MONTHLY }
    ];

    segurosServiceSpy.getAll.and.returnValue(of(insurances));

    component.loadInsurances();

    expect(component.insurances[0].id).toBe('a');
    expect(component.insurances[1].id).toBe('b');
  });

  it('debería abrir el modal de vista con el seguro seleccionado', () => {
    const insurance = mockInsurances[0];

    component.openViewModal(insurance);

    expect(component.selectedInsurance).toBe(insurance);
    expect(component.displayViewModal).toBeTrue();
  });
  it('debería llamar a applyFilters al cambiar el filtro', () => {
    spyOn(component, 'applyFilters');
    component.onFilterChange();
    expect(component.applyFilters).toHaveBeenCalled();
  });
  it('debería llamar handleError al fallar la actualización de estado', () => {
    const insurance = mockInsurances[0];
    const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });

    segurosServiceSpy.updateStatus.and.returnValue(throwError(() => error));
    spyOn(component, 'handleError');

    component.changeStatus(insurance);

    expect(segurosServiceSpy.updateStatus).toHaveBeenCalledWith(insurance.id!, !insurance.active);
    expect(component.handleError).toHaveBeenCalledWith(error);
  });

  it('debería eliminar el seguro tras confirmación y mostrar mensaje de éxito', fakeAsync(() => {
    const insurance = mockInsurances[0];
    segurosServiceSpy.delete.and.returnValue(of(void 0));
    segurosServiceSpy.getAll.and.returnValue(of(mockInsurances));
    spyOn(confirmationService, 'confirm').and.callFake((options: any) => options.accept());

    component.deleteInsurance(insurance);
    tick();

    expect(segurosServiceSpy.delete).toHaveBeenCalledWith(insurance.id!);
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Seguro eliminado correctamente'
    }));
    expect(segurosServiceSpy.getAll).toHaveBeenCalled();
  }));

  it('debería manejar error al intentar eliminar seguro', fakeAsync(() => {
    const insurance = mockInsurances[0];
    const error = new HttpErrorResponse({ status: 500, statusText: 'Error de servidor' });
    segurosServiceSpy.delete.and.returnValue(throwError(() => error));
    spyOn(component, 'handleError');
    spyOn(confirmationService, 'confirm').and.callFake((options: any) => options.accept());

    component.deleteInsurance(insurance);
    tick();

    expect(segurosServiceSpy.delete).toHaveBeenCalledWith(insurance.id!);
    expect(component.handleError).toHaveBeenCalledWith(error);
  }));

  it('handleError debería mostrar el mensaje de error específico si existe', () => {
    const errorResponse = { message: 'Mensaje de error específico' };
    const httpError = new HttpErrorResponse({ error: errorResponse });

    component.handleError(httpError);

    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Mensaje de error específico'
    });
  });

  it('handleError debería mostrar mensaje genérico cuando no hay mensaje en error', () => {
    const httpError = new HttpErrorResponse({ error: 'Error desconocido' });

    component.handleError(httpError);

    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error en el servidor'
    });
  });
  it('debería mostrar error si insurance no está definido al guardar', () => {
    component.insurance = undefined as any;
    component.saveInsurance();

    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      summary: 'Error',
      detail: 'No se puede guardar porque el seguro no está definido.'
    }));

  });
  it('debería guardar un seguro nuevo y mostrar mensaje de éxito', () => {
    component.isEditing = false;
    component.insurance = {
      name: 'Nuevo Seguro',
      coverage: 100,
      deductible: 50,
      paymentAmount: 10,
      type: InsuranceType.LIFE,
      description: '',
      paymentPeriod: PaymentPeriod.MONTHLY,
      active: true
    };

    segurosServiceSpy.save.and.returnValue(of(component.insurance));  // Observable que emite éxito
    segurosServiceSpy.getAll.and.returnValue(of(mockInsurances)); // Para loadInsurances()

    component.saveInsurance();

    expect(segurosServiceSpy.save).toHaveBeenCalledWith(component.insurance);
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      detail: 'Seguro registrado correctamente'
    }));
  });
  it('debería manejar error al guardar seguro nuevo', () => {
    component.isEditing = false;
    component.insurance = {
      name: 'Nuevo Seguro',
      coverage: 100,
      deductible: 50,
      paymentAmount: 10,
      type: InsuranceType.LIFE,
      description: '',
      paymentPeriod: PaymentPeriod.MONTHLY,
      active: true
    };

    const error = new HttpErrorResponse({ status: 500, error: { message: 'Error servidor' } });
    segurosServiceSpy.save.and.returnValue(throwError(() => error));

    spyOn(component, 'handleError').and.callThrough();

    component.saveInsurance();

    expect(segurosServiceSpy.save).toHaveBeenCalled();
    expect(component.handleError).toHaveBeenCalledWith(error);
  });

  it('debería actualizar un seguro y mostrar mensaje de éxito', () => {
    component.isEditing = true;
    component.currentInsuranceId = mockInsurances[0].id!;
    component.insurance = { ...mockInsurances[0], name: 'Editado' };

    segurosServiceSpy.update.and.returnValue(of(component.insurance));
    segurosServiceSpy.getAll.and.returnValue(of(mockInsurances)); // Para loadInsurances()

    component.saveInsurance();

    expect(segurosServiceSpy.update).toHaveBeenCalledWith(component.currentInsuranceId, component.insurance);
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      detail: 'Seguro actualizado correctamente'
    }));
  });
  it('debería manejar error al actualizar seguro', () => {
    component.isEditing = true;
    component.currentInsuranceId = mockInsurances[0].id!;
    component.insurance = { ...mockInsurances[0], name: 'Editado' };

    const error = new HttpErrorResponse({ status: 500, error: { message: 'Error servidor' } });
    segurosServiceSpy.update.and.returnValue(throwError(() => error));

    spyOn(component, 'handleError').and.callThrough();

    component.saveInsurance();

    expect(segurosServiceSpy.update).toHaveBeenCalled();
    expect(component.handleError).toHaveBeenCalledWith(error);
  });


  it('debería eliminar el seguro y mostrar mensaje de éxito cuando se acepta la confirmación', () => {
    const insurance = { id: '123', name: 'Seguro Test', active: true } as Insurance;

    spyOn(component, 'loadInsurances').and.callFake(() => { });
    segurosServiceSpy.delete.and.returnValue(of(void 0));  // <-- aquí el cambio

    spyOn(confirmationService, 'confirm').and.callFake((confirmation: { accept: () => void }) => {
      confirmation.accept();
      return confirmationService;  // <-- aquí el retorno para cumplir la firma
    });

    component.deleteInsurance(insurance);

    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(segurosServiceSpy.delete).toHaveBeenCalledWith(insurance.id!);
    expect(component.loadInsurances).toHaveBeenCalled();
    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      detail: 'Seguro eliminado correctamente'
    }));
  });

  it('debería cargar beneficios y asignarlos a allBenefits y availableBenefits cuando no está editando', () => {
    const mockBenefits: Benefit[] = [
      { id: '1', name: 'Cobertura Dental', description: 'Limpieza' },
      { id: '2', name: 'Cobertura Visual', description: 'Lentes' }
    ];


    component.isEditing = false;
    segurosServiceSpy.getAllBenefits.and.returnValue(of(mockBenefits));

    component.getBenefits();

    expect(segurosServiceSpy.getAllBenefits).toHaveBeenCalled();
    expect(component.allBenefits).toEqual(mockBenefits);
    expect(component.availableBenefits).toEqual(mockBenefits);
  });
  it('debería cargar beneficios solo en allBenefits si está en modo edición', () => {
    const mockBenefits: Benefit[] = [
      { id: '1', name: 'Cobertura Dental', description: 'Limpieza' },
      { id: '2', name: 'Cobertura Visual', description: 'Lentes' }
    ];


    component.isEditing = true;
    segurosServiceSpy.getAllBenefits.and.returnValue(of(mockBenefits));

    component.getBenefits();

    expect(segurosServiceSpy.getAllBenefits).toHaveBeenCalled();
    expect(component.allBenefits).toEqual(mockBenefits);
    expect(component.availableBenefits).toBeUndefined(); // No debe llenarse
  });
  it('debería prevenir ingreso de "-" o "e" en preventNegativeInput', () => {
    const preventDefaultSpy = jasmine.createSpy('preventDefault');

    const dashEvent = { key: '-', preventDefault: preventDefaultSpy } as unknown as KeyboardEvent;
    component.preventNegativeInput(dashEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();

    const eEvent = { key: 'e', preventDefault: preventDefaultSpy } as unknown as KeyboardEvent;
    component.preventNegativeInput(eEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('no debería prevenir otras teclas en preventNegativeInput', () => {
    const preventDefaultSpy = jasmine.createSpy('preventDefault');
    const event = { key: '5', preventDefault: preventDefaultSpy } as unknown as KeyboardEvent;

    component.preventNegativeInput(event);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
  it('debería eliminar beneficio de selectedBenefits y agregarlo a availableBenefits', () => {
    const mockBenefit = { id: '1', name: 'Beneficio 1', description: 'desc' };
    component.selectedBenefits = [mockBenefit];
    component.availableBenefits = [];

    const detectChangesSpy = spyOn(component['cdr'], 'detectChanges');

    component.eliminarBeneficioDesdePickList(mockBenefit);

    expect(component.selectedBenefits).not.toContain(mockBenefit);
    expect(component.availableBenefits).toContain(mockBenefit);
    expect(detectChangesSpy).toHaveBeenCalled();
  });

  it('debería mover elementos a selectedBenefits y eliminarlos de availableBenefits', () => {
    const benefit1 = { id: '1', name: 'B1', description: '' };
    const benefit2 = { id: '2', name: 'B2', description: '' };
    const event = { items: [benefit1, benefit2] } as PickListMoveToTargetEvent;

    component.selectedBenefits = [benefit1]; // ya está seleccionado
    component.availableBenefits = [benefit1, benefit2];

    component.onMoveToTarget(event);

    expect(component.selectedBenefits).toContain(benefit1);
    expect(component.selectedBenefits).toContain(benefit2);
    expect(component.availableBenefits).not.toContain(benefit2);
  });
  it('debería mover elementos de selectedBenefits a availableBenefits', () => {
    const benefit1 = { id: '1', name: 'B1', description: '' };
    const benefit2 = { id: '2', name: 'B2', description: '' };
    const event = { items: [benefit1] } as PickListMoveToSourceEvent;

    component.selectedBenefits = [benefit1, benefit2];
    component.availableBenefits = [];

    component.onMoveToSource(event);

    expect(component.availableBenefits).toContain(benefit1);
    expect(component.selectedBenefits).not.toContain(benefit1);
  });
  it('debería imprimir los beneficios seleccionados en consola', () => {
    const mockBenefits = [
      { id: '1', name: 'B1', description: '' },
      { id: '2', name: 'B2', description: '' }
    ];

    component.selectedBenefits = mockBenefits;

    const logSpy = spyOn(console, 'log');

    component.verBeneficiosSeleccionados();

    expect(logSpy).toHaveBeenCalledWith('Beneficios seleccionados:', mockBenefits);
  });



});
