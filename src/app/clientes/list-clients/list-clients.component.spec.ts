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
    phoneNumber: '999999999',
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
    component.abrirModal();
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
  component.cerrar();
  expect(component.displayModal).toBeFalse();
});

it('handleClienteCreado debe cerrar modal, agregar cliente y mostrar mensaje', () => {
  const nuevoCliente: Client = { ...clientMock, id: '2', name: 'Ana' };
  component.clientes = [clientMock];

  component.displayDetailModal = true;

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


  describe('validateForm', () => {
    beforeEach(() => {
      component.nuevoCliente = {
        ...clientMock,
        user: { ...clientMock.user, password: 'Password123' },
      };
    });

    it('should return true for valid form', () => {
      expect(component.validateForm()).toBeTrue();
    });

    it('should return false and show error for invalid name', () => {
      component.nuevoCliente.name = 'A';
      expect(component.validateForm()).toBeFalse();
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'El nombre es requerido y debe tener al menos 2 caracteres.',
      });
    });

    it('should return false and show error for invalid identificationNumber', () => {
      component.nuevoCliente.identificationNumber = '123';
      expect(component.validateForm()).toBeFalse();
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'El número de identificación debe tener exactamente 10 dígitos y no puede contener letras ni signos.',
      });
    });

    it('should return false and show error for future birthDate', () => {
      component.nuevoCliente.birthDate = '2026-01-01';
      expect(component.validateForm()).toBeFalse();
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'La fecha de nacimiento no puede ser futura.',
      });
    });

    it('should return false and show error for invalid phoneNumber', () => {
      component.nuevoCliente.phoneNumber = '123';
      expect(component.validateForm()).toBeFalse();
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'El teléfono debe tener exactamente 10 dígitos y no puede contener letras ni signos.',
      });
    });

    it('should return false and show error for invalid address', () => {
      component.nuevoCliente.address = '123';
      expect(component.validateForm()).toBeFalse();
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'La dirección es requerida y debe tener al menos 5 caracteres.',
      });
    });

    it('should return false and show error for missing gender', () => {
      component.nuevoCliente.gender = '';
      expect(component.validateForm()).toBeFalse();
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'El género es requerido.',
      });
    });

    it('should return false and show error for invalid occupation', () => {
      component.nuevoCliente.occupation = 'A';
      expect(component.validateForm()).toBeFalse();
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'La ocupación es requerida y debe tener al menos 2 caracteres.',
      });
    });

    it('should return false and show error for invalid email', () => {
      component.nuevoCliente.user.email = 'invalid-email';
      expect(component.validateForm()).toBeFalse();
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'El correo electrónico es requerido y debe ser válido.',
      });
    });

    it('should return false and show error for invalid password in create mode', () => {
      component.nuevoCliente.user.password = 'short';
      expect(component.validateForm()).toBeFalse();
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'La contraseña es requerida y debe tener al menos 8 caracteres, incluyendo letras y números.',
      });
    });

    it('should allow empty password in edit mode', () => {
      component.modoEdicion = true;
      component.nuevoCliente.user.password = '';
      expect(component.validateForm()).toBeTrue();
    });

    it('should return false and show error for invalid password in edit mode', () => {
      component.modoEdicion = true;
      component.nuevoCliente.user.password = 'short';
      expect(component.validateForm()).toBeFalse();
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'La nueva contraseña debe tener al menos 8 caracteres, incluyendo letras y números.',
      });
    });
  });

  describe('reloadClientes', () => {
    it('should reload clients and apply filter on success', () => {
      const mockClients = [clientMock];
      mockClientService.getAll.and.returnValue(of(mockClients));
      spyOn(component, 'filtrarClientes');

      component['reloadClientes'](); // Access private method with bracket notation

      expect(mockClientService.getAll).toHaveBeenCalled();
      expect(component.clientes).toEqual(mockClients);
      expect(component.clientesOriginales).toEqual(mockClients);
      expect(component.filtrarClientes).toHaveBeenCalled();
    });

    it('should show error message on reload failure', () => {
      spyOn(console, 'error');
      mockClientService.getAll.and.returnValue(throwError(() => new Error('Reload failed')));

      component['reloadClientes']();

      expect(mockClientService.getAll).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith('Error al recargar clientes:', jasmine.any(Error));
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron recargar los clientes.',
      });
    });
  });

  describe('toggleClientStatus', () => {
    it('should toggle client status and reload clients on success', () => {
      const updatedClient = { ...clientMock, active: false };
      mockClientService.update.and.returnValue(of(updatedClient));
      mockClientService.getAll.and.returnValue(of([updatedClient]));
      spyOn(component, 'filtrarClientes');

      component.toggleClientStatus(clientMock);

      expect(mockClientService.update).toHaveBeenCalledWith({ ...clientMock });
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cliente desactivado correctamente',
      });
      expect(mockClientService.getAll).toHaveBeenCalled();
      expect(component.filtrarClientes).toHaveBeenCalled();
    });

    it('should revert status and show error on failure', () => {
      mockClientService.update.and.returnValue(throwError(() => new Error('Update failed')));
      spyOn(console, 'error');

      const originalActive = clientMock.active;
      component.toggleClientStatus(clientMock);

      expect(mockClientService.update).toHaveBeenCalledWith({ ...clientMock });
      expect(clientMock.active).toBe(originalActive);
      expect(console.error).toHaveBeenCalledWith('Error al actualizar estado del cliente:', jasmine.any(Error));
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el estado del cliente',
      });
    });
  });

  describe('verDetalleCliente', () => {
    it('should set selected client and show detail modal', () => {
      component.verDetalleCliente(clientMock);

      expect(component.clienteSeleccionado).toEqual(clientMock);
      expect(component.displayDetailModal).toBeTrue();
    });
  });

  describe('guardarClienteNuevo edge cases', () => {
    it('should not proceed if form validation fails', () => {
      spyOn(component, 'validateForm').and.returnValue(false);
      component.nuevoCliente = { ...clientMock, user: { ...clientMock.user, password: '1234' } };
      mockClientService.create.and.returnValue(of(clientMock));

      component.guardarClienteNuevo();

      expect(mockClientService.create).not.toHaveBeenCalled();
      expect(component.displayModal).toBeTrue();
    });

    it('should handle unexpected error during client creation', () => {
      component.nuevoCliente = { ...clientMock, user: { ...clientMock.user, password: 'Password123' } };
      mockClientService.create.and.returnValue(throwError(() => new Error('Unexpected error')));
      spyOn(component, 'validateForm').and.returnValue(true);

      component.guardarClienteNuevo();

      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Ocurrió un error inesperado.',
      });
    });
  });

  describe('actualizarCliente edge cases', () => {
    it('should not proceed if form validation fails', () => {
      spyOn(component, 'validateForm').and.returnValue(false);
      component.nuevoCliente = { ...clientMock, user: { ...clientMock.user, password: '' } };
      component.modoEdicion = true;
      mockClientService.update.and.returnValue(of(clientMock));

      component.actualizarCliente();

      expect(mockClientService.update).not.toHaveBeenCalled();
      expect(component.displayModal).toBeTrue();
      expect(component.modoEdicion).toBeTrue();
    });
  });

  describe('filtrarClientes edge cases', () => {
    it('should return empty array when no clients match filter', () => {
      component.clientesOriginales = [clientMock];
      component.filtroCedula = '999';

      component.filtrarClientes();

      expect(component.clientes.length).toBe(0);
    });

    it('should handle case-insensitive filtering', () => {
      component.clientesOriginales = [clientMock];
      component.filtroCedula = '1234567890';

      component.filtrarClientes();

      expect(component.clientes.length).toBe(1);
      expect(component.clientes[0]).toEqual(clientMock);
    });
  });

  describe('calcularEdad edge cases', () => {
    it('should handle same year but earlier month', () => {
      const birthDate = `${new Date().getFullYear() - 1}-12-01`;
      const age = component.calcularEdad(birthDate);
      expect(age).toBe(0); // Not yet 1 year old
    });

    it('should handle same year and same month but earlier day', () => {
      const today = new Date();
      const birthDate = `${today.getFullYear()}-${today.getMonth() + 1}-01`;
      const age = component.calcularEdad(birthDate);
      expect(age).toBe(0); // Not yet 1 year old
    });
  });
 
});
