
import { ListClientsComponent } from './list-clients.component';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ClientsService } from '../../core/services/clients.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { Client } from '../../shared/interfaces/client';

describe('ListClientsComponent', () => {
  let component: ListClientsComponent;
  let fixture: ComponentFixture<ListClientsComponent>;
  let mockClientsService: jasmine.SpyObj<ClientsService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockConfirmationService: jasmine.SpyObj<ConfirmationService>;

  const mockClients: Client[] = [
    {
      id: '1',
      name: 'Juan',
      lastName: 'Perez',
      identificationNumber: '1234567890',
      birthDate: '1990-01-01',
      phoneNumber: 123456789,
      address: 'Calle 1',
      gender: 'M',
      occupation: 'Ingeniero',
      active: true,
      user: {
        id: 'u1',
        name: 'Juan Perez',
        email: 'juan@mail.com',
        rol: 'CLIENT',
        active: true
      }
    },
    {
      id: '2',
      name: 'Ana',
      lastName: 'Lopez',
      identificationNumber: '0987654321',
      birthDate: '1985-05-10',
      phoneNumber: 987654321,
      address: 'Calle 2',
      gender: 'F',
      occupation: 'Doctora',
      active: false,
      user: {
        id: 'u2',
        name: 'Ana Lopez',
        email: 'ana@mail.com',
        rol: 'CLIENT',
        active: true
      }
    }
  ];

  beforeEach(async () => {
    mockClientsService = jasmine.createSpyObj('ClientsService', ['getAll', 'create', 'update', 'delete']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);
    mockConfirmationService = jasmine.createSpyObj('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [ListClientsComponent],
      providers: [
        { provide: ClientsService, useValue: mockClientsService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ConfirmationService, useValue: mockConfirmationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('obtenerClientes should set clientes and clientesOriginales', () => {
    mockClientsService.getAll.and.returnValue(of(mockClients));
    component.obtenerClientes();
    expect(component.clientes).toEqual(mockClients);
    expect(component.clientesOriginales).toEqual(mockClients);
  });

  it('filtrarClientes should filter by identificationNumber', () => {
    component.clientesOriginales = mockClients;
    component.filtroCedula = '1234';
    component.filtrarClientes();
    expect(component.clientes.length).toBe(1);
    expect(component.clientes[0].identificationNumber).toBe('1234567890');
  });

  it('filtrarClientes should restore all if filtroCedula is empty', () => {
    component.clientesOriginales = mockClients;
    component.filtroCedula = '';
    component.filtrarClientes();
    expect(component.clientes.length).toBe(2);
  });

  it('validarCliente should return false if name is empty', () => {
    const invalidClient = { ...mockClients[0], name: '   ' };
    expect(component.validarCliente(invalidClient as any)).toBeFalse();
    expect(mockMessageService.add).toHaveBeenCalled();
  });

  it('validarCliente should return false if lastName is empty', () => {
    const invalidClient = { ...mockClients[0], lastName: '   ' };
    expect(component.validarCliente(invalidClient as any)).toBeFalse();
    expect(mockMessageService.add).toHaveBeenCalled();
  });

  it('validarCliente should return false if birthDate is empty', () => {
    const invalidClient = { ...mockClients[0], birthDate: '' };
    expect(component.validarCliente(invalidClient as any)).toBeFalse();
    expect(mockMessageService.add).toHaveBeenCalled();
  });

  it('validarCliente should return false if birthDate is in the future', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const invalidClient = { ...mockClients[0], birthDate: futureDate.toISOString().split('T')[0] };
    expect(component.validarCliente(invalidClient as any)).toBeFalse();
    expect(mockMessageService.add).toHaveBeenCalled();
  });

  it('validarCliente should return true for valid client', () => {
    expect(component.validarCliente(mockClients[0] as any)).toBeTrue();
  });

  it('guardarClienteNuevo should add client on success', fakeAsync(() => {
    const newClient = { ...mockClients[0] };
    component.nuevoCliente = newClient as any;
    mockClientsService.create.and.returnValue(of(newClient));
    component.guardarClienteNuevo();
    tick();
    expect(component.clientes).toContain(newClient);
    expect(component.displayModal).toBeFalse();
    expect(mockMessageService.add).toHaveBeenCalled();
  }));

  it('guardarClienteNuevo should show error on error', fakeAsync(() => {
    component.nuevoCliente = mockClients[0] as any;
    mockClientsService.create.and.returnValue(throwError(() => ({ status: 412, error: { message: 'Error' } })));
    component.guardarClienteNuevo();
    tick();
    expect(mockMessageService.add).toHaveBeenCalled();
  }));

  it('toggleClientStatus should update client and show success', fakeAsync(() => {
    const client = { ...mockClients[0] };
    mockClientsService.update.and.returnValue(of(client));
    component.toggleClientStatus(client);
    tick();
    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  }));

  it('toggleClientStatus should revert on error', fakeAsync(() => {
    const client = { ...mockClients[0], active: true };

    mockClientsService.update.and.returnValue(throwError(() => 'error'));
    component.toggleClientStatus(client);
    tick();
    expect(client.active).toBeFalse();
    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  }));

  it('eliminarCliente should call delete and remove client', fakeAsync(() => {
    component.clientes = [...mockClients];
    mockClientsService.delete.and.returnValue(of({}));
    mockConfirmationService.confirm.and.callFake((options: any) => options.accept());
    component.eliminarCliente('1');
    tick();
    expect(component.clientes.length).toBe(1);
    expect(component.clientes[0].id).toBe('2');
  }));

  it('abrirModal should set modoEdicion and nuevoCliente for edit', () => {
    component.abrirModal(mockClients[0]);
    expect(component.modoEdicion).toBeTrue();
    expect(component.nuevoCliente.id).toBe('1');
    expect(component.displayModal).toBeTrue();
  });

  it('abrirModal should reset nuevoCliente for new', () => {
    component.abrirModal();
    expect(component.modoEdicion).toBeFalse();
    expect(component.nuevoCliente.id).toBe('');
    expect(component.displayModal).toBeTrue();
  });

  it('actualizarCliente should update client and show success', fakeAsync(() => {
    const updatedClient = { ...mockClients[0], name: 'Nuevo' };
    component.nuevoCliente = updatedClient as any;
    component.clientes = [mockClients[0]];
    mockClientsService.update.and.returnValue(of(updatedClient));
    component.actualizarCliente();
    tick();
    expect(component.clientes[0].name).toBe('Nuevo');
    expect(component.displayModal).toBeFalse();
    expect(component.modoEdicion).toBeFalse();
    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
  }));

  it('actualizarCliente should show error on failure', fakeAsync(() => {
    component.nuevoCliente = mockClients[0] as any;
    mockClientsService.update.and.returnValue(throwError(() => 'error'));
    component.actualizarCliente();
    tick();
    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error' }));
  }));

  it('calcularEdad should return correct age', () => {
    const birthDate = '2000-01-01';
    const age = component.calcularEdad(birthDate);
    const expectedAge = new Date().getFullYear() - 2000 - (new Date().getMonth() < 0 || (new Date().getMonth() === 0 && new Date().getDate() < 1) ? 1 : 0);
    expect(age).toEqual(jasmine.any(Number));
  });

  it('calcularEdad should return empty string if fechaNacimiento is undefined', () => {
    expect(component.calcularEdad(undefined)).toBe('');
  });

  it('verDetalleCliente should set clienteSeleccionado and displayDetailModal', () => {
    component.verDetalleCliente(mockClients[0]);
    expect(component.clienteSeleccionado).toEqual(mockClients[0]);
    expect(component.displayDetailModal).toBeTrue();
  });

  it('cerrarModal should set displayModal to false', () => {
    component.displayModal = true;
    component.cerrarModal();
    expect(component.displayModal).toBeFalse();
  });

  it('handleClienteCreado should add client and close modal', () => {
    const client = mockClients[0];
    component.clientes = [];
    component.handleClienteCreado(client);
    expect(component.clientes).toContain(client);
    expect(component.displayModal).toBeFalse();
  });

  it('soloNumerosMaxLength should prevent non-numeric input', () => {
    const event = {
      target: { value: '' },
      charCode: 65, // 'A'
      keyCode: 65,
      preventDefault: jasmine.createSpy()
    } as any as KeyboardEvent;
    component.soloNumerosMaxLength(event, 10);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('soloNumerosMaxLength should prevent input if maxLength reached', () => {
    const event = {
      target: { value: '1234567890' },
      charCode: 49, // '1'
      keyCode: 49,
      preventDefault: jasmine.createSpy()
    } as any as KeyboardEvent;
    component.soloNumerosMaxLength(event, 10);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('soloNumerosMaxLength should allow numeric input if under maxLength', () => {
    const event = {
      target: { value: '123' },
      charCode: 49, // '1'
      keyCode: 49,
      preventDefault: jasmine.createSpy()
    } as any as KeyboardEvent;
    component.soloNumerosMaxLength(event, 10);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});