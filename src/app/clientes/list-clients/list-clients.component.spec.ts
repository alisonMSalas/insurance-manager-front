import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ListClientsComponent } from './list-clients.component';
import { ClientsService } from '../../core/services/clients.service';
import { ApiClientService } from '../../core/api/httpclient';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { Client } from '../../shared/interfaces/client';

// Mocks para servicios
class ClientsServiceMock {
    getAll() { return of([]); }
    update(client: Client) { return of(client); }
    create(client: Client) { return of(client); }
    delete(id: string) { return of({}); }
}

class ApiClientServiceMock {
    getCurrentUserEmail() { return 'test@example.com'; }
}

class ConfirmationServiceMock {
    confirm(params: any) {
        params.accept();
    }
}

class MessageServiceMock {
    add(msg: any) { }
}

describe('ListClientsComponent', () => {
    let component: ListClientsComponent;
    let fixture: ComponentFixture<ListClientsComponent>;
    let clientsService: ClientsService;
    let apiClientService: ApiClientService;
    let confirmationService: ConfirmationService;
    let messageService: MessageService;

    const mockClients: Client[] = [
        {
            id: '1',
            name: 'Juan',
            lastName: 'Perez',
            identificationNumber: '1234567890',
            birthDate: '2000-01-01',
            phoneNumber: '0987654321',
            address: 'Calle Falsa 123',
            gender: 'M',
            occupation: 'Ingeniero',
            active: true,
            user: {
                id: 'u1',
                name: 'Juan Perez',
                email: 'juan@example.com',
                rol: 'CLIENT',
                active: true
            }
        },
        {
            id: '2',
            name: 'Maria',
            lastName: 'Lopez',
            identificationNumber: '0987654321',
            birthDate: '1995-05-15',
            phoneNumber: '0999888777',
            address: 'Av Siempre Viva 742',
            gender: 'F',
            occupation: 'Abogada',
            active: true,
            user: {
                id: 'u2',
                name: 'Maria Lopez',
                email: 'maria@example.com',
                rol: 'CLIENT',
                active: true
            }
        }
    ];
    const mockClientResponse: Client = {
        id: '1',
        name: 'Test',
        lastName: 'User',
        identificationNumber: '1234567890',
        birthDate: '2000-01-01',
        phoneNumber: '0987654321',
        address: 'Test address',
        gender: 'M',
        occupation: 'Tester',
        active: true,
        user: {
            id: 'u1',
            name: 'Test User',
            email: 'test@example.com',
            rol: 'CLIENT',
            active: true
        },
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ListClientsComponent],
            providers: [
                { provide: ClientsService, useClass: ClientsServiceMock },
                { provide: ApiClientService, useClass: ApiClientServiceMock },
                { provide: ConfirmationService, useClass: ConfirmationServiceMock },
                { provide: MessageService, useClass: MessageServiceMock },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ListClientsComponent);
        component = fixture.componentInstance;

        clientsService = TestBed.inject(ClientsService);
        apiClientService = TestBed.inject(ApiClientService);
        confirmationService = TestBed.inject(ConfirmationService);
        messageService = TestBed.inject(MessageService);

        spyOn(console, 'error'); // Para silenciar errores en consola durante tests
        fixture.detectChanges();
    });

    it('should create component and initialize', () => {
        spyOn(apiClientService, 'getCurrentUserEmail').and.returnValue('test@example.com');
        spyOn(component, 'obtenerClientes').and.callThrough();

        component.ngOnInit();

        expect(component.currentUserEmail).toBe('test@example.com');
        expect(component.obtenerClientes).toHaveBeenCalled();
    });

    describe('obtenerClientes', () => {
        it('debe cargar clientes correctamente', () => {
            spyOn(clientsService, 'getAll').and.returnValue(of(mockClients));
            spyOn(component, 'initializeMenuItems').and.callThrough();
            spyOn(component, 'filtrarClientes').and.callThrough();

            component.obtenerClientes();

            expect(component.clientesOriginales.length).toBe(2);
            expect(component.clientes.length).toBe(2);
            expect(component.initializeMenuItems).toHaveBeenCalled();
            expect(component.filtrarClientes).toHaveBeenCalled();
        });

        it('debe manejar error al cargar clientes', () => {
            spyOn(clientsService, 'getAll').and.returnValue(throwError(() => ({ message: 'error' })));
            spyOn(messageService, 'add');

            component.obtenerClientes();

            expect(console.error).toHaveBeenCalled();
            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'error',
                summary: 'Error'
            }));
        });
    });

    describe('initializeMenuItems', () => {
        it('debe crear items del menú para cada cliente', () => {
            component.clientes = mockClients;
            component.initializeMenuItems();

            expect(Object.keys(component.menuItems).length).toBe(mockClients.length);
            expect(component.menuItems['1'].length).toBe(3);
            expect(component.menuItems['1'][0].label).toBe('Ver');
            expect(component.menuItems['1'][1].label).toBe('Editar');
            expect(component.menuItems['1'][2].label).toBe('Eliminar');
        });
    });

    describe('filtrarClientes', () => {
        beforeEach(() => {
            component.clientesOriginales = mockClients;
        });

        it('debe mostrar todos cuando filtro está vacío', () => {
            component.filtroCedula = '   ';
            component.filtrarClientes();

            expect(component.clientes.length).toBe(mockClients.length);
        });

        it('debe filtrar clientes por identificationNumber', () => {
            component.filtroCedula = '1234';
            component.filtrarClientes();

            expect(component.clientes.length).toBe(1);
            expect(component.clientes[0].identificationNumber).toContain('1234');
        });
    });

    describe('restrictToNumbers', () => {
        it('debe limpiar input para dejar solo números', () => {
            const mockEvent = {
                target: {
                    value: 'abc123xyz456',
                }
            } as unknown as Event;
            const client = { fieldTest: '' };

            component.restrictToNumbers(mockEvent, client, 'fieldTest');

            expect(client.fieldTest).toBe('123456');
            expect((mockEvent.target as HTMLInputElement).value).toBe('123456');
        });
    });

    describe('toggleClientStatus', () => {
        beforeEach(() => {
            component.currentUserEmail = 'juan@example.com';
        });

        it('no permite cambiar estado de cliente propio', () => {
            spyOn(messageService, 'add');
            const cliente = { ...mockClients[0], active: true };

            component.toggleClientStatus(cliente);

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'error',
                detail: 'No puedes cambiar el estado de tu propio cliente'
            }));
            expect(cliente.active).toBe(true);
        });

        it('cambia estado y muestra éxito', fakeAsync(() => {
            spyOn(messageService, 'add');
            spyOn(clientsService, 'update').and.returnValue(of(mockClientResponse));
            spyOn(component, 'obtenerClientes');
            component.currentUserEmail = 'other@example.com';

            const cliente = { ...mockClients[0], active: false };

            component.toggleClientStatus(cliente);

            tick();
            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'success',
                detail: 'Cliente activado correctamente'
            }));
            expect(component.obtenerClientes).toHaveBeenCalled();
        }));

        it('reversa cambio si error al actualizar', fakeAsync(() => {
            spyOn(messageService, 'add');
            spyOn(clientsService, 'update').and.returnValue(throwError(() => ({ message: 'fail' })));
            component.currentUserEmail = 'other@example.com';

            const cliente = { ...mockClients[0], active: true };

            component.toggleClientStatus(cliente);

            tick();

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'error',
                detail: 'No se pudo actualizar el estado del cliente'
            }));
            expect(cliente.active).toBe(false);
        }));
    });

    describe('abrirModalCrear', () => {
        it('debe preparar nuevo cliente y mostrar modal', () => {
            component.mostrarModal = false;
            component.nuevoCliente.name = 'Test';

            component.abrirModalCrear();

            expect(component.modo).toBe('crear');
            expect(component.nuevoCliente.name).toBe('');
            expect(component.mostrarModal).toBeTrue();
        });
    });

    describe('abrirModalEditar', () => {
        it('debe abrir modal con datos de cliente existente', () => {
            component.clientes = mockClients;
            component.abrirModalEditar('1');

            expect(component.modo).toBe('editar');
            expect(component.nuevoCliente.id).toBe('1');
            expect(component.mostrarModal).toBeTrue();
            expect(component.nuevoCliente.user.password).toBe('');
        });

        it('muestra error si cliente no existe', () => {
            spyOn(messageService, 'add');

            component.clientes = mockClients;
            component.abrirModalEditar('nonexistent');

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'error',
                detail: 'Cliente no encontrado'
            }));
        });
    });

    describe('guardarCliente', () => {
        beforeEach(() => {
            spyOn(component, 'validateForm').and.returnValue(true);
            spyOn(component, 'obtenerClientes');
            spyOn(messageService, 'add');
        });

        it('no hace nada si validateForm retorna falso', () => {
            (component.validateForm as jasmine.Spy).and.returnValue(false);
            component.guardarCliente();
            expect(messageService.add).not.toHaveBeenCalled();
        });

        it('crea cliente en modo crear y cierra modal', fakeAsync(() => {
            component.modo = 'crear';
            spyOn(clientsService, 'create').and.returnValue(of(mockClientResponse));

            component.nuevoCliente = {
                id: '',
                name: 'Nuevo',
                lastName: 'Cliente',
                identificationNumber: '1234567890',
                birthDate: '2000-01-01',
                phoneNumber: '0987654321',
                address: 'Direccion',
                gender: 'M',
                occupation: 'Tester',
                active: true,
                user: {
                    id: '',
                    name: '',
                    email: 'nuevo@cliente.com',
                    rol: 'CLIENT',
                    active: true,
                    password: '123456',
                }
            };

            component.guardarCliente();
            tick();

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'success',
                detail: 'Cliente creado correctamente'
            }));
            expect(component.mostrarModal).toBeFalse();
            expect(component.obtenerClientes).toHaveBeenCalled();
        }));

        it('actualiza cliente en modo editar y cierra modal', fakeAsync(() => {
            component.modo = 'editar';
            spyOn(clientsService, 'update').and.returnValue(of(mockClientResponse));

            component.nuevoCliente = {
                id: '1',
                name: 'Editar',
                lastName: 'Cliente',
                identificationNumber: '1234567890',
                birthDate: '2000-01-01',
                phoneNumber: '0987654321',
                address: 'Direccion',
                gender: 'M',
                occupation: 'Tester',
                active: true,
                user: {
                    id: 'u1',
                    name: '',
                    email: 'editar@cliente.com',
                    rol: 'CLIENT',
                    active: true,
                    password: '',
                }
            };

            component.guardarCliente();
            tick();

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'success',
                detail: 'Cliente actualizado correctamente'
            }));
            expect(component.mostrarModal).toBeFalse();
            expect(component.obtenerClientes).toHaveBeenCalled();
        }));

        it('muestra error si falla crear cliente', fakeAsync(() => {
            component.modo = 'crear';
            spyOn(clientsService, 'create').and.returnValue(throwError(() => ({ error: { message: 'fail create' } })));
            component.nuevoCliente = { ...component.nuevoCliente, user: { ...component.nuevoCliente.user, email: 'test@test.com' } };

            component.guardarCliente();
            tick();

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'error',
                detail: 'fail create'
            }));
        }));

        it('muestra error si falla actualizar cliente', fakeAsync(() => {
            component.modo = 'editar';
            spyOn(clientsService, 'update').and.returnValue(throwError(() => ({ error: { message: 'fail update' } })));
            component.nuevoCliente = { ...component.nuevoCliente, user: { ...component.nuevoCliente.user, email: 'test@test.com' } };

            component.guardarCliente();
            tick();

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'error',
                detail: 'fail update'
            }));
        }));
    });

    describe('eliminarCliente', () => {
        beforeEach(() => {
            component.clientes = mockClients;
            component.currentUserEmail = 'other@example.com';
            spyOn(messageService, 'add');
            spyOn(component, 'obtenerClientes');
        });

        it('muestra error si cliente no existe', () => {
            component.eliminarCliente('no-existe');

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'error',
                detail: 'Cliente no encontrado'
            }));
        });

        it('no permite eliminar cliente propio', () => {
            component.currentUserEmail = 'juan@example.com';

            component.eliminarCliente('1');

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'error',
                detail: 'No puedes eliminar tu propio cliente'
            }));
        });

        it('elimina cliente con confirmacion', fakeAsync(() => {
            spyOn(clientsService, 'delete').and.returnValue(of(void 0));
            spyOn(messageService, 'add');

            component.eliminarCliente('2');

            tick();

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'success',
                detail: 'Cliente eliminado correctamente'
            }));
            expect(component.obtenerClientes).toHaveBeenCalled();
        }));

        it('muestra error si falla eliminar cliente', fakeAsync(() => {
            spyOn(clientsService, 'delete').and.returnValue(throwError(() => ({ error: { message: 'fail delete' } })));
            spyOn(messageService, 'add');

            component.eliminarCliente('2');

            tick();

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'error',
                detail: 'fail delete'
            }));
        }));
    });

    describe('verDetalleCliente', () => {
        beforeEach(() => {
            component.clientes = mockClients;
            spyOn(messageService, 'add');
        });

        it('muestra detalle si cliente existe', () => {
            component.verDetalleCliente('1');

            expect(component.clienteSeleccionado?.id).toBe('1');
            expect(component.displayViewModal).toBeTrue();
        });

        it('muestra error si cliente no existe', () => {
            component.verDetalleCliente('no-existe');

            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
                severity: 'error',
                detail: 'Cliente no encontrado'
            }));
        });
    });

    describe('validateForm', () => {
        beforeEach(() => {
            component.nuevoCliente = {
                id: '',
                name: 'Juan',
                lastName: 'Perez',
                identificationNumber: '1234567890',
                birthDate: '2000-01-01',
                phoneNumber: '0987654321',
                address: 'Direccion 123',
                gender: 'M',
                occupation: 'Tester',
                active: true,
                user: {
                    id: '',
                    name: '',
                    email: 'test@test.com',
                    rol: 'CLIENT',
                    active: true,
                    password: ''
                }
            };
            spyOn(messageService, 'add');
        });

        it('valida correctamente un formulario válido', () => {
            expect(component.validateForm()).toBeTrue();
            expect(messageService.add).not.toHaveBeenCalled();
        });

        it('detecta nombre inválido', () => {
            component.nuevoCliente.name = 'A';
            expect(component.validateForm()).toBeFalse();
            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: jasmine.stringContaining('nombre') }));
        });

        it('detecta apellido inválido', () => {
            component.nuevoCliente.lastName = 'B';
            expect(component.validateForm()).toBeFalse();
            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: jasmine.stringContaining('apellido') }));
        });

        it('detecta número de identificación inválido', () => {
            component.nuevoCliente.identificationNumber = '123';
            expect(component.validateForm()).toBeFalse();
            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: jasmine.stringContaining('identificación') }));
        });

        it('detecta fecha de nacimiento vacía', () => {
            component.nuevoCliente.birthDate = '';
            expect(component.validateForm()).toBeFalse();
            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: jasmine.stringContaining('nacimiento') }));
        });

        it('detecta fecha de nacimiento futura', () => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            component.nuevoCliente.birthDate = tomorrow.toISOString();

            expect(component.validateForm()).toBeFalse();
            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: jasmine.stringContaining('futura') }));
        });

        it('detecta teléfono inválido', () => {
            component.nuevoCliente.phoneNumber = '123';
            expect(component.validateForm()).toBeFalse();
            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: jasmine.stringContaining('teléfono') }));
        });

        it('detecta dirección inválida', () => {
            component.nuevoCliente.address = '1234';
            expect(component.validateForm()).toBeFalse();
            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: jasmine.stringContaining('dirección') }));
        });

        it('detecta género vacío', () => {
            component.nuevoCliente.gender = '';
            expect(component.validateForm()).toBeFalse();
            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: jasmine.stringContaining('género') }));
        });

        it('detecta ocupación inválida', () => {
            component.nuevoCliente.occupation = 'A';
            expect(component.validateForm()).toBeFalse();
            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: jasmine.stringContaining('ocupación') }));
        });

        it('detecta email inválido', () => {
            component.nuevoCliente.user.email = 'no-email';
            expect(component.validateForm()).toBeFalse();
            expect(messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({ detail: jasmine.stringContaining('correo electrónico') }));
        });
    });

    describe('calcularEdad', () => {
        it('retorna edad correcta', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 30);
            const age = component.calcularEdad(birthDate.toISOString());
            expect(typeof age).toBe('number');
            expect(age).toBe(30);
        });

        it('retorna cadena vacía si no hay fecha', () => {
            expect(component.calcularEdad(undefined)).toBe('');
        });
    });

    describe('showActionsMenu', () => {
        it('llama a toggle del menu', () => {
            component.menu = {
                toggle: jasmine.createSpy('toggle')
            };
            const event = {} as Event;

            component.showActionsMenu(event, mockClients[0]);

            expect(component.menu.toggle).toHaveBeenCalledWith(event);
        });
    });

    describe('refreshData', () => {
        it('establece loading y llama obtenerClientes', () => {
            spyOn(component, 'obtenerClientes');
            component.refreshData();
            expect(component.loading).toBeTrue();
            expect(component.obtenerClientes).toHaveBeenCalled();
        });
    });

});
