import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ListClientsComponent } from './list-clients.component';
import { ClientsService } from '../../core/services/clients.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { Client } from '../../shared/interfaces/client';

describe('ListClientsComponent', () => {
  let component: ListClientsComponent;
  let fixture: ComponentFixture<ListClientsComponent>;
  let mockClientService: jasmine.SpyObj<ClientsService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockConfirmationService: jasmine.SpyObj<ConfirmationService>;

  const clientMock: Client = {
    id: '1',
    name: 'Juan',
    lastName: 'Pérez',
    identificationNumber: '1234567890',
    birthDate: '2000-01-01',
    phoneNumber: 999999999,
    address: 'Calle 123',
    gender: 'Masculino',
    occupation: 'Ingeniero',
    active: true,
    user: {
      id: 'u1',
      name: 'Juan Pérez',
      email: 'juan@example.com',
      rol: 'CLIENT',
      active: true
    }
  };

  beforeEach(waitForAsync(() => {
    const clientServiceSpy = jasmine.createSpyObj('ClientsService', ['getAll', 'create', 'update', 'delete']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    const confirmationServiceSpy = jasmine.createSpyObj('ConfirmationService', ['confirm']);

    TestBed.configureTestingModule({
      imports: [ListClientsComponent],
      providers: [
        { provide: ClientsService, useValue: clientServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: ConfirmationService, useValue: confirmationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListClientsComponent);
    component = fixture.componentInstance;

    mockClientService = TestBed.inject(ClientsService) as jasmine.SpyObj<ClientsService>;
    mockMessageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    mockConfirmationService = TestBed.inject(ConfirmationService) as jasmine.SpyObj<ConfirmationService>;
  }));

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe obtener los clientes correctamente', () => {
    mockClientService.getAll.and.returnValue(of([clientMock]));

    component.obtenerClientes();

    expect(component.clientes.length).toBe(1);
    expect(component.clientes[0].name).toBe('Juan');
  });

  it('debe mostrar error al fallar obtener clientes', () => {
    spyOn(console, 'error');
    mockClientService.getAll.and.returnValue(throwError(() => new Error('Error de red')));

    component.obtenerClientes();

    expect(console.error).toHaveBeenCalled();
    expect(component.clientes.length).toBe(0);
  });

  it('debe filtrar clientes por cédula', () => {
    component.clientesOriginales = [clientMock];
    component.filtroCedula = '123';

    component.filtrarClientes();

    expect(component.clientes.length).toBe(1);
  });

  it('debe guardar un nuevo cliente correctamente', () => {
    component.nuevoCliente = { ...clientMock, user: { ...clientMock.user, password: '1234' } };
    mockClientService.create.and.returnValue(of(clientMock));

    component.guardarClienteNuevo();

    expect(component.clientes.length).toBe(1);
    expect(component.displayModal).toBeFalse();
    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      detail: jasmine.any(String)
    }));
  });

  it('debe mostrar error 412 al crear cliente duplicado', () => {
    component.nuevoCliente = { ...clientMock, user: { ...clientMock.user, password: '1234' } };
    mockClientService.create.and.returnValue(throwError(() => ({
      status: 412,
      error: { message: 'Cliente ya existe' }
    })));

    component.guardarClienteNuevo();

    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      detail: 'Cliente ya existe'
    }));
  });

  it('debe actualizar un cliente correctamente', () => {
    const actualizado = { ...clientMock, name: 'Carlos' };
    component.nuevoCliente = actualizado;
    component.clientes = [clientMock];
    mockClientService.update.and.returnValue(of(actualizado));

    component.actualizarCliente();

    expect(component.clientes[0].name).toBe('Carlos');
    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      detail: jasmine.any(String)
    }));
  });

  it('debe manejar error al actualizar cliente', () => {
    component.nuevoCliente = clientMock;
    mockClientService.update.and.returnValue(throwError(() => new Error('Error actualización')));

    component.actualizarCliente();

    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error'
    }));
  });

  it('debe eliminar un cliente correctamente', () => {
    component.clientes = [clientMock];
    mockClientService.delete.and.returnValue(of(void 0));
    mockConfirmationService.confirm.and.callFake((options: any) => options.accept());

    component.eliminarCliente(clientMock.id);

    expect(component.clientes.length).toBe(0);
    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      detail: jasmine.any(String)
    }));
  });

  it('debe calcular correctamente la edad', () => {
    const edad = component.calcularEdad('2000-01-01');
    expect(typeof edad).toBe('number');
    expect(edad).toBeGreaterThan(0);
  });

  it('debe abrir modal en modo edición', () => {
    component.abrirModal(clientMock);
    expect(component.displayModal).toBeTrue();
    expect(component.modoEdicion).toBeTrue();
  });

  it('debe abrir modal para nuevo cliente', () => {
    component.abrirModal();
    expect(component.displayModal).toBeTrue();
    expect(component.modoEdicion).toBeFalse();
  });

  it('debe establecer displayModal en true al llamar a abrir()', () => {
    component.displayModal = false;
    component.abrir();
    expect(component.displayModal).toBeTrue();
  });

  it('debe establecer displayModal en false al llamar a cerrar()', () => {
    component.displayModal = true;
    component.cerrar();
    expect(component.displayModal).toBeFalse();
  });

  it('debe llamar a obtenerClientes() al inicializar el componente', () => {
    const obtenerClientesSpy = spyOn(component, 'obtenerClientes');
    component.ngOnInit();
    expect(obtenerClientesSpy).toHaveBeenCalled();
  });

  it('cerrarModal debe poner displayModal en false', () => {
  component.displayModal = true;
  component.cerrarModal();
  expect(component.displayModal).toBeFalse();
});

it('handleClienteCreado debe cerrar modal, agregar cliente y mostrar mensaje', () => {
  const nuevoCliente: Client = { ...clientMock, id: '2', name: 'Ana' };
  component.clientes = [clientMock];

  component.handleClienteCreado(nuevoCliente);

  expect(component.displayModal).toBeFalse();
  expect(component.clientes.length).toBe(2);
  expect(component.clientes).toContain(nuevoCliente);
  expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
    severity: 'success',
    detail: jasmine.stringMatching(/creado/i)
  }));
});
it('debe eliminar un cliente correctamente', () => {
    component.clientes = [clientMock];
    mockClientService.delete.and.returnValue(of(void 0));
    mockConfirmationService.confirm.and.callFake((options: any) => {
      options.accept(); // Simula que el usuario acepta la confirmación
      return mockConfirmationService; // Return the mock to satisfy the type
    });

    component.eliminarCliente(clientMock.id);

    expect(mockConfirmationService.confirm).toHaveBeenCalled();
    expect(mockClientService.delete).toHaveBeenCalledWith(clientMock.id);
    expect(component.clientes.length).toBe(0);
    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      detail: jasmine.any(String)
    }));
  });

  it('debe manejar error al eliminar un cliente', () => {
    spyOn(console, 'error'); // Espía console.error
    component.clientes = [clientMock];
    mockClientService.delete.and.returnValue(throwError(() => new Error('Error al eliminar cliente')));
    mockConfirmationService.confirm.and.callFake((options: any) => {
      options.accept(); // Simula que el usuario acepta la confirmación
      return mockConfirmationService; // Return the mock to satisfy the type
    });

    component.eliminarCliente(clientMock.id);

    expect(mockConfirmationService.confirm).toHaveBeenCalled();
    expect(mockClientService.delete).toHaveBeenCalledWith(clientMock.id);
    expect(console.error).toHaveBeenCalledWith('Error al eliminar cliente:', jasmine.any(Error));
    expect(component.clientes.length).toBe(1); // El cliente no debería eliminarse
    expect(mockMessageService.add).not.toHaveBeenCalled(); // No se debería mostrar mensaje de éxito
  });

  it('debe mostrar el detalle del cliente y abrir el modal', () => {
    spyOn(console, 'log'); // Espía console.log para verificar la llamada
    const cliente = clientMock; // Usa el mock definido en tu setup

    component.verDetalleCliente(cliente);

    expect(console.log).toHaveBeenCalledWith('Ver detalle:', cliente);
    expect(component.clienteSeleccionado).toBe(cliente);
    expect(component.displayDetailModal).toBeTrue();
  });
  it('debe mostrar mensaje de error genérico al fallar la creación del cliente con error inesperado', () => {
  component.nuevoCliente = { ...clientMock, user: { ...clientMock.user, password: '1234' } };
  mockClientService.create.and.returnValue(throwError(() => new Error('Error inesperado')));

  component.guardarClienteNuevo();

  expect(mockClientService.create).toHaveBeenCalledWith(component.nuevoCliente);
  expect(component.clientes.length).toBe(0); // No se agrega el cliente
  expect(component.displayModal).toBeTrue(); // El modal no se cierra
  expect(mockMessageService.add).toHaveBeenCalledWith({
    severity: 'error',
    summary: 'Error',
    detail: 'Ocurrió un error inesperado.'
  });
});
it('debe actualizar el estado del cliente correctamente y mostrar mensaje de éxito', () => {
    const cliente = { ...clientMock, active: true }; // Cliente inicialmente activo
    mockClientService.update.and.returnValue(of(cliente)); // Simula éxito retornando el cliente

    component.toggleClientStatus(cliente);

    expect(mockClientService.update).toHaveBeenCalledWith(jasmine.objectContaining({ id: cliente.id, active: true }));
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Cliente activado correctamente'
    });
  });

  it('debe manejar error al actualizar el estado del cliente, revertir el cambio y mostrar mensaje de error', () => {
    spyOn(console, 'error'); // Espía console.error
    const cliente = { ...clientMock, active: true }; // Cliente inicialmente activo
    cliente.active = false; // Simula cambio local antes de la llamada al servicio
    mockClientService.update.and.returnValue(throwError(() => new Error('Error al actualizar')));

    component.toggleClientStatus(cliente);

    expect(mockClientService.update).toHaveBeenCalledWith(jasmine.objectContaining({ id: cliente.id, active: false }));
    expect(console.error).toHaveBeenCalledWith('Error al actualizar estado del cliente:', jasmine.any(Error));
    expect(cliente.active).toBe(true); // Verifica que el estado se revierte
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar el estado del cliente'
    });
  });

});
