import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ListUsersComponent } from './list-users.component';
import { UsersService, User } from '../../../core/services/users.service';
import { ApiClientService } from '../../../core/api/httpclient';
import { of, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';

describe('ListUsersComponent (integración)', () => {
  let component: ListUsersComponent;
  let fixture: ComponentFixture<ListUsersComponent>;
  let mockUserService: jasmine.SpyObj<UsersService>;
  let mockApiClientService: jasmine.SpyObj<ApiClientService>;
  let mockConfirmationService: jasmine.SpyObj<ConfirmationService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  

  const mockUsers: User[] = [
    { id: '1', name: 'Juan', email: 'juan@mail.com', rol: 'ADMIN', active: true },
    { id: '2', name: 'Ana', email: 'ana@mail.com', rol: 'AGENT', active: false },
  ];

  beforeEach(async () => {
    // Mockear localStorage globalmente
    spyOn(localStorage, 'getItem').and.returnValue(null);
  
    mockUserService = jasmine.createSpyObj<UsersService>('UsersService', ['getAll', 'create', 'update', 'delete']);
    mockApiClientService = jasmine.createSpyObj<ApiClientService>('ApiClientService', ['getCurrentUserEmail']);
    mockConfirmationService = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm']);
    mockMessageService = jasmine.createSpyObj<MessageService>('MessageService', ['add']);
    mockUserService.getAll.and.returnValue(of(mockUsers));
    await TestBed.configureTestingModule({
      imports: [ListUsersComponent], // Asegúrate de que el componente está siendo importado correctamente
      providers: [
        { provide: UsersService, useValue: mockUserService },
        { provide: ApiClientService, useValue: mockApiClientService },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        { provide: MessageService, useValue: mockMessageService },
      ],
    }).compileComponents();
  
    fixture = TestBed.createComponent(ListUsersComponent);
    component = fixture.componentInstance;
  });
  
  it('debe cargar los usuarios en ngOnInit', () => {
    mockUserService.getAll.and.returnValue(of(mockUsers));
    mockApiClientService.getCurrentUserEmail.and.returnValue('juan@mail.com');

    fixture.detectChanges(); // Trigger ngOnInit

    expect(component.users.length).toBe(2);
    expect(component.filteredUsers.length).toBe(2);
    expect(mockUserService.getAll).toHaveBeenCalled();
  });

  it('debe filtrar usuarios por nombre', () => {
    component.users = [...mockUsers];
    component.searchQuery = 'juan';
    component.applyFilters();

    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].name).toBe('Juan');
  });
  it('debe filtrar usuarios por rol', () => {
    component.users = [...mockUsers];
    component.selectedRole = 'ADMIN';
    component.applyFilters();

    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].rol).toBe('ADMIN');
  });

  it('debe filtrar usuarios por estado activo', () => {
    component.users = [...mockUsers];
    component.selectedStatus = true;
    component.applyFilters();

    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].active).toBeTrue();
  });

  it('debe filtrar usuarios por rol y estado activo combinados', () => {
    component.users = [...mockUsers];
    component.selectedRole = 'AGENT';
    component.selectedStatus = false;
    component.applyFilters();

    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].rol).toBe('AGENT');
    expect(component.filteredUsers[0].active).toBeFalse();
  });
  it('debe actualizar searchQuery y aplicar filtros en onSearchChange', () => {
    const event = { target: { value: 'ana' } } as unknown as Event;
    spyOn(component, 'applyFilters');
    
    component.onSearchChange(event);
    
    expect(component.searchQuery).toBe('ana');
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('debe actualizar selectedRole y aplicar filtros en onRoleChange', () => {
    const event = { value: 'ADMIN' };
    spyOn(component, 'applyFilters');

    component.onRoleChange(event);

    expect(component.selectedRole).toBe('ADMIN');
    expect(component.applyFilters).toHaveBeenCalled();
  });

  it('debe actualizar selectedStatus y aplicar filtros en onStatusChange', () => {
    const event = { value: true };
    spyOn(component, 'applyFilters');

    component.onStatusChange(event);

    expect(component.selectedStatus).toBeTrue();
    expect(component.applyFilters).toHaveBeenCalled();
  });
  it('debe abrir el modal en modo crear con usuario vacío', () => {
    component.abrirModalCrear();

    expect(component.modo).toBe('crear');
    expect(component.usuario).toEqual({
      name: '',
      email: '',
      rol: '',
      password: '',
      active: true,
    });
    expect(component.mostrarModal).toBeTrue();
  });

  it('debe abrir el modal en modo editar con datos del usuario y contraseña vacía', () => {
    const userToEdit: User = {
      id: '2',
      name: 'Ana',
      email: 'ana@mail.com',
      rol: 'AGENT',
      active: false,
    };

    component.abrirModalEditar(userToEdit);

    expect(component.modo).toBe('editar');
    expect(component.usuario).toEqual({
      id: '2',
      name: 'Ana',
      email: 'ana@mail.com',
      rol: 'AGENT',
      active: false,
      password: '',
    });
    expect(component.mostrarModal).toBeTrue();
  });

  

  // it('debe evitar eliminar el usuario actual', fakeAsync(() => {
  //   // Configuramos el email del usuario actual
  //   component.currentUserEmail = 'juan@mail.com';
  //   const user = { email: 'juan@mail.com', name: 'Juan', id: '1' } as User;
  
  //   // Llamamos al método deleteUser
  //   component.deleteUser(user);
  
  //   // Verificamos que se haya mostrado el mensaje de error y no se haya llamado a confirmationService.confirm
  //   expect(mockMessageService.add).toHaveBeenCalledWith({
  //     severity: 'error',
  //     summary: 'Error',
  //     detail: 'No puedes eliminar tu propio usuario',
  //   });
  
  //   // Verificamos que no se haya mostrado el diálogo de confirmación
  //   expect(mockConfirmationService.confirm).not.toHaveBeenCalled();
  // }));
  
  

  // it('debe llamar a create si está en modo crear y los campos están completos', fakeAsync(() => {
  //   const user = {
  //     id: '1',
  //     name: 'Nuevo Usuario',
  //     email: 'nuevo@example.com',
  //     rol: 'ADMIN',
  //     password: '123456',
  //     active: true,
  //   };
  
  //   component.modo = 'crear';
  //   component.usuario = { ...user };
  
  //   // Configurar mock para create
  //   mockUserService.create.and.returnValue(of(user));
  //   // Configurar mock para getAll (llamado en loadUsers)
  //   mockUserService.getAll.and.returnValue(of([user]));
  
  //   component.guardarUsuario();
  //   tick();
  
  //   expect(mockUserService.create).toHaveBeenCalledWith(jasmine.objectContaining({
  //     name: user.name,
  //     email: user.email,
  //     rol: user.rol,
  //     password: user.password,
  //     active: user.active,
  //   }));
  //   expect(mockMessageService.add).toHaveBeenCalledWith({
  //     severity: 'success',
  //     summary: 'Éxito',
  //     detail: 'Usuario creado correctamente',
  //   });
  //   expect(mockUserService.getAll).toHaveBeenCalled(); // Verificar que loadUsers se llamó
  // }));  
  
  // it('debe manejar errores al cargar usuarios', fakeAsync(() => {
  //   // Simulando un error en el servicio getAll
  //   mockUserService.getAll.and.returnValue(throwError(() => new Error('Error al cargar usuarios')));
  
  //   // Llamar al método loadUsers
  //   component.loadUsers();
  //   tick(); // Espera a que los observables se resuelvan
  
  //   // Verificar que MessageService.add se haya llamado con el error esperado
  //   expect(mockMessageService.add).toHaveBeenCalledWith({
  //     severity: 'error',
  //     summary: 'Error',
  //     detail: 'No se pudieron cargar los usuarios',
  //   });
  
  //   // Verificar que los usuarios no se hayan cargado
  //   expect(component.users).toBeUndefined();
  //   expect(component.filteredUsers).toBeUndefined();
  // }));
  it('debe mostrar error si faltan campos requeridos al guardar', () => {
    // Configuramos un usuario con campos vacíos para que se active la validación
    component.usuario = {
      name: '',
      email: '',
      rol: '',
      password: '',  // Asegúrate de que la contraseña también esté vacía si es necesario
      active: true,
    };
  
    spyOn(component.messageService, 'add'); // Es importante espiar el método add de MessageService
  
    // Llamamos al método guardarUsuario, que debe validar los campos requeridos
    component.guardarUsuario();
  
    // Comprobamos que el MessageService.add haya sido llamado con el mensaje correcto
    expect(component.messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Por favor, completa todos los campos requeridos',
    });
  });
  
  it('debe mostrar error si no se pueden cargar los usuarios', () => {
    // Configurar el mock para que getAll() falle y devuelva un error
    mockUserService.getAll.and.returnValue(throwError(() => new Error('Error al cargar usuarios')));
  
    spyOn(component.messageService, 'add'); // Es importante espiar el método add de MessageService
  
    // Llamamos al método loadUsers
    component.loadUsers();
  
    // Verificamos que el MessageService.add haya sido llamado con el mensaje de error esperado
    expect(component.messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los usuarios',
    });
  });
  it('debe mostrar error si intenta eliminar su propio usuario', () => {
    // Configuramos el email del usuario actual
    component.currentUserEmail = 'juan@mail.com';
  
    // Creamos un usuario con el mismo email
    const userToDelete: User = { email: 'juan@mail.com', name: 'Juan', id: '1' } as User;
  
    spyOn(component.messageService, 'add'); // Espiamos el método add de MessageService
  
    // Llamamos al método deleteUser
    component.deleteUser(userToDelete);
  
    // Verificamos que MessageService.add haya sido llamado con el mensaje de error correcto
    expect(component.messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No puedes eliminar tu propio usuario',
    });
  });
  it('debe mostrar error si la contraseña está vacía al crear un usuario', () => {
    // Creamos un usuario con la contraseña vacía
    const userToCreate: User = {
      id: '3',
      name: 'Nuevo Usuario',
      email: 'nuevo@example.com',
      rol: 'ADMIN',
    
      active: true,
    };
  
    // Establecemos el modo a "crear"
    component.modo = 'crear';
    component.usuario = { ...userToCreate };
  
    // Espiamos el método messageService.add para verificar que se llame con el mensaje de error
    spyOn(component.messageService, 'add');
  
    // Llamamos al método guardarUsuario
    component.guardarUsuario();
  
    // Verificamos que se haya mostrado el mensaje de error para la contraseña
    expect(component.messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'La contraseña es requerida para crear un usuario',
    });
  });
  
  it('debe mostrar la información del usuario al llamar a viewUser', () => {
    const user: User = {
      id: '1',
      name: 'Juan',
      email: 'juan@mail.com',
      rol: 'ADMIN',
      active: true,
    };
  
    spyOn(component.messageService, 'add'); // Espiar el método add de MessageService
  
    // Llamar al método viewUser
    component.viewUser(user);
  
    // Verificar que se haya llamado a console.log con el usuario correcto
    const consoleSpy = spyOn(console, 'log');
    component.viewUser(user);
    expect(consoleSpy).toHaveBeenCalledWith('Ver usuario:', user);
  
    // Verificar que el mensaje fue añadido con los parámetros correctos
    expect(component.messageService.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Información',
      detail: 'Visualizando usuario: Juan',
    });
  });
  
  it('debe mostrar error y cambiar el estado si se intenta cambiar el estado del propio usuario', () => {
    const user: User = {
      id: '1',
      name: 'Juan',
      email: 'juan@mail.com',
      rol: 'ADMIN',
      active: true,
    };
  
    component.currentUserEmail = 'juan@mail.com';
    spyOn(component.messageService, 'add');
  
    component.toggleUserStatus(user);
  
    expect(component.messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No puedes cambiar el estado de tu propio usuario',
    });
    expect(user.active).toBe(false); // El estado cambia de true a false
    expect(mockUserService.update).not.toHaveBeenCalled();
  });
  it('debe cambiar el estado del usuario y mostrar mensaje de éxito si el usuario no es el actual', fakeAsync(() => {
    const user: User = {
      id: '2',
      name: 'Ana',
      email: 'ana@mail.com',
      rol: 'AGENT',
      active: false,
    };
  
    component.currentUserEmail = 'juan@mail.com';
    spyOn(component.messageService, 'add');
    mockUserService.update.and.returnValue(of(user));
  
    component.toggleUserStatus(user);
    tick();
  
    expect(mockUserService.update).toHaveBeenCalledWith(jasmine.objectContaining({
      id: user.id,
      name: user.name,
      email: user.email,
      rol: user.rol,
      active: false, // El estado permanece false
    }));
    expect(component.messageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Usuario desactivado correctamente',
    });
    expect(user.active).toBe(false); // El estado permanece false
  }));

  it('debe revertir el cambio y mostrar mensaje de error si el servicio update falla', fakeAsync(() => {
    const user: User = {
      id: '2',
      name: 'Ana',
      email: 'ana@mail.com',
      rol: 'AGENT',
      active: false,
    };
  
    component.currentUserEmail = 'juan@mail.com';
    spyOn(component.messageService, 'add');
    spyOn(console, 'error'); // Espiar console.error para evitar mensajes en los logs
    mockUserService.update.and.returnValue(throwError(() => new Error('Error al actualizar')));
  
    component.toggleUserStatus(user);
    tick();
  
    expect(mockUserService.update).toHaveBeenCalledWith(jasmine.objectContaining({
      id: user.id,
      name: user.name,
      email: user.email,
      rol: user.rol,
      active: false, // El estado permanece false en la llamada
    }));
    expect(component.messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar el estado del usuario',
    });
    expect(user.active).toBe(true); // El estado se cambia a true en el bloque de error
  }));
});