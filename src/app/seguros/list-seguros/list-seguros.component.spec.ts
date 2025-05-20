// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { ListSegurosComponent } from './list-seguros.component';
// import { of, throwError } from 'rxjs';
// import { SegurosService } from '../service/seguros.service';
// import { MessageService, ConfirmationService } from 'primeng/api';
// import { HttpErrorResponse } from '@angular/common/http';
// import { Insurance, InsuranceType, PaymentPeriod } from '../../shared/interfaces/insurance';

// describe('ListSegurosComponent', () => {
//   let component: ListSegurosComponent;
//   let fixture: ComponentFixture<ListSegurosComponent>;
//   let segurosServiceSpy: jasmine.SpyObj<SegurosService>;
//   let messageServiceSpy: jasmine.SpyObj<MessageService>;
//   let confirmationService: ConfirmationService;

//   const mockInsurances: Insurance[] = [
//     { id: '1', name: 'Seguro A', type: InsuranceType.HEALTH, description: '', coverage: 1000, deductible: 200, paymentAmount: 100, paymentPeriod: PaymentPeriod.MONTHLY, active: true },
//     { id: '2', name: 'Seguro B', type: InsuranceType.LIFE, description: '', coverage: 2000, deductible: 300, paymentAmount: 150, paymentPeriod: PaymentPeriod.YEARLY, active: false },
//   ];

//   beforeEach(async () => {
//     const segurosSpy = jasmine.createSpyObj('SegurosService', ['getAll', 'updateStatus', 'delete', 'save', 'update']);
//     const messageSpy = jasmine.createSpyObj('MessageService', ['add']);

//     await TestBed.configureTestingModule({
//       imports: [ListSegurosComponent],
//       providers: [
//         { provide: SegurosService, useValue: segurosSpy },
//         { provide: MessageService, useValue: messageSpy },
//         ConfirmationService
//       ]
//     }).compileComponents();

//     fixture = TestBed.createComponent(ListSegurosComponent);
//     component = fixture.componentInstance;
//     // segurosServiceSpy = TestBed.inject(SegurosService) as jasmine.SpyObj<SegurosService>;
//     messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
//     confirmationService = TestBed.inject(ConfirmationService);
//   });

//   it('debería crear el componente', () => {
//     expect(component).toBeTruthy();
//   });

//   it('debería cargar seguros y aplicar filtros', () => {
//     segurosServiceSpy.getAll.and.returnValue(of(mockInsurances));
//     component.loadInsurances();
//     expect(component.insurances.length).toBe(2);
//     expect(component.filteredInsurances.length).toBe(2);
//   });

//   it('debería manejar error al cargar seguros', () => {
//     const error = new HttpErrorResponse({ error: { message: 'Error de servidor' }, status: 500 });
//     segurosServiceSpy.getAll.and.returnValue(throwError(() => error));
//     component.loadInsurances();
//     expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
//   });

//   it('debería filtrar seguros por estado y tipo', () => {
//     component.insurances = mockInsurances;
//     component.selectedStatus = true;
//     component.selectedType = InsuranceType.HEALTH;
//     component.applyFilters();
//     expect(component.filteredInsurances.length).toBe(1);
//   });

//   it('debería cambiar estado del seguro', () => {
//     const insurance = mockInsurances[0];
//     segurosServiceSpy.updateStatus.and.returnValue(of(mockInsurances[0]));

//     segurosServiceSpy.getAll.and.returnValue(of(mockInsurances));
//     component.changeStatus(insurance);
//     expect(segurosServiceSpy.updateStatus).toHaveBeenCalledWith(insurance.id!, false);
//     expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: 'Estado actualizado correctamente' }));
//   });

//   it('debería eliminar seguro tras confirmación', fakeAsync(() => {
//     const insurance = mockInsurances[0];
//     segurosServiceSpy.delete.and.returnValue(of(void 0));

//     segurosServiceSpy.getAll.and.returnValue(of(mockInsurances));

//     spyOn(confirmationService, 'confirm');


//     component.deleteInsurance(insurance);
//     tick();
//     expect(segurosServiceSpy.delete).toHaveBeenCalledWith(insurance.id!);
//     expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: 'Seguro eliminado correctamente' }));
//   }));

//   it('debería guardar un seguro nuevo', () => {
//     segurosServiceSpy.save.and.returnValue(of(mockInsurances[0]));
//     segurosServiceSpy.getAll.and.returnValue(of(mockInsurances));
//     component.isEditing = false;
//     component.saveInsurance();
//     expect(segurosServiceSpy.save).toHaveBeenCalled();
//     expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: 'Seguro registrado correctamente' }));
//   });

//   it('debería actualizar un seguro existente', () => {
//     const editedInsurance = { ...mockInsurances[0], name: 'Editado' };
//     component.isEditing = true;
//     component.currentInsuranceId = editedInsurance.id!;
//     component.insurance = { ...editedInsurance };
//     segurosServiceSpy.update.and.returnValue(of(editedInsurance));
//     segurosServiceSpy.getAll.and.returnValue(of(mockInsurances));
//     component.saveInsurance();
//     expect(segurosServiceSpy.update).toHaveBeenCalledWith(editedInsurance.id!, editedInsurance);

//     expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: 'Seguro actualizado correctamente' }));
//   });

//   it('debería abrir el modal para crear seguro', () => {
//     component.openModal();
//     expect(component.display).toBeTrue();
//     expect(component.isEditing).toBeFalse();
//   });

//   it('debería abrir el modal para editar seguro', () => {
//     const insurance = mockInsurances[0];
//     component.openModal(insurance);
//     expect(component.display).toBeTrue();
//     expect(component.isEditing).toBeTrue();
//     expect(component.insurance.name).toBe(insurance.name);
//   });

//   it('debería resetear campos correctamente', () => {
//     component.insurance.name = 'Modificado';
//     component.resetCampos();
//     expect(component.insurance.name).toBe('');
//     expect(component.insurance.coverage).toBe(0);
//   });
// });
