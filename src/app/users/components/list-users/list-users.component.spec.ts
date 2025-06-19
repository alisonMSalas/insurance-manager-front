import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ListUsersComponent } from './list-users.component';
import { UsersService, User } from '../../../core/services/users.service';
import { ApiClientService } from '../../../core/api/httpclient';
import { of, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

describe('ListUsersComponent (integración)', () => {
  const user: User = {
    id: '1',
    name: 'Juan',
    email: 'juan@test.com',
    rol: 'admin',
    active: true,
  };

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
    mockUserService = jasmine.createSpyObj('UsersService', ['getAll', 'create', 'update', 'delete']);
    mockApiClientService = jasmine.createSpyObj('ApiClientService', ['getCurrentUserEmail']);
    mockConfirmationService = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);
    
    // Configurar valores por defecto para los mocks
    mockUserService.getAll.and.returnValue(of(mockUsers));
    mockUserService.create.and.returnValue(of({} as any));
    mockUserService.update.and.returnValue(of({} as any));
    mockUserService.delete.and.returnValue(of({} as any));
    mockApiClientService.getCurrentUserEmail.and.returnValue('juan@mail.com');
    mockConfirmationService.confirm.and.callFake((options: any) => {
      if (options && options.accept) options.accept();
      return mockConfirmationService;
    });
    
    await TestBed.configureTestingModule({
      imports: [
        ListUsersComponent,
        HttpClientTestingModule,
        ConfirmDialogModule,
        NoopAnimationsModule
      ], 
      providers: [
        { provide: UsersService, useValue: mockUserService },
        { provide: ApiClientService, useValue: mockApiClientService },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        { provide: MessageService, useValue: mockMessageService },
        provideNoopAnimations()
      ],
    }).compileComponents();
  
    fixture = TestBed.createComponent(ListUsersComponent);
    component = fixture.componentInstance;
  });
  
  it('debe cargar los usuarios en ngOnInit', () => {
    mockUserService.getAll.and.returnValue(of(mockUsers));
    mockApiClientService.getCurrentUserEmail.and.returnValue('juan@mail.com');

    fixture.detectChanges(); 

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

  it('debe mostrar error si faltan campos requeridos al guardar', () => {
    component.usuario = {
      name: '',
      email: '',
      rol: '',
      password: '', 
      active: true,
    };
  
    component.guardarUsuario();
  
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Por favor, completa todos los campos requeridos',
    });
  });
  
  it('debe mostrar error si no se pueden cargar los usuarios', () => {
    mockUserService.getAll.and.returnValue(throwError(() => new Error('Error al cargar usuarios')));
  
    component.loadUsers();
  
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los usuarios',
    });
  });

  it('debe mostrar error si intenta eliminar su propio usuario', () => {
    component.currentUserEmail = 'juan@mail.com';
  
    const userToDelete: User = { email: 'juan@mail.com', name: 'Juan', id: '1' } as User;
  
    component.deleteUser(userToDelete);
  
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No puedes eliminar tu propio usuario',
    });
  });

  it('debe mostrar error si la contraseña está vacía al crear un usuario', () => {
    component.modo = 'crear';
    component.usuario = { name: 'Juan', email: 'juan@test.com', rol: 'ADMIN', password: '' };
  
    component.guardarUsuario();
  
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Por favor, completa todos los campos requeridos',
    });
  });

  it('debe mostrar la información del usuario al llamar a viewUser', () => {
    const userToView: User = {
      id: '1',
      name: 'Juan',
      email: 'juan@mail.com',
      rol: 'ADMIN',
      active: true,
    };
  
    spyOn(console, 'log');
  
    component.viewUser(userToView);
  
    expect(console.log).toHaveBeenCalledWith('Ver usuario:', userToView);
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Información',
      detail: 'Visualizando usuario: Juan',
    });
  });

  it('debe mostrar error y cambiar el estado si se intenta cambiar el estado del propio usuario', () => {
    component.currentUserEmail = 'juan@mail.com';
    const userToToggle: User = {
      id: '1',
      name: 'Juan',
      email: 'juan@mail.com',
      rol: 'ADMIN',
      active: true,
    };
  
    component.toggleUserStatus(userToToggle);
  
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No puedes cambiar el estado de tu propio usuario',
    });
  });

  it('debe cambiar el estado del usuario y mostrar mensaje de éxito si el usuario no es el actual', () => {
    component.currentUserEmail = 'admin@mail.com';
    const userToToggle: User = {
      id: '2',
      name: 'Ana',
      email: 'ana@mail.com',
      rol: 'AGENT',
      active: true,
    };
  
    mockUserService.update.and.returnValue(of(userToToggle));
  
    component.toggleUserStatus(userToToggle);
  
    expect(mockUserService.update).toHaveBeenCalledWith(jasmine.objectContaining({
      id: userToToggle.id,
      active: false,
    }));
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Usuario desactivado correctamente',
    });
  });

  it('debe revertir el cambio y mostrar mensaje de error si el servicio update falla', () => {
    component.currentUserEmail = 'admin@mail.com';
    const userToToggle: User = {
      id: '2',
      name: 'Ana',
      email: 'ana@mail.com',
      rol: 'AGENT',
      active: true,
    };
  
    mockUserService.update.and.returnValue(throwError(() => new Error('Error al actualizar')));
    spyOn(console, 'error');
  
    component.toggleUserStatus(userToToggle);
  
    expect(userToToggle.active).toBe(true); // Debe revertir el cambio
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar el estado del usuario',
    });
    expect(console.error).toHaveBeenCalledWith('Error al actualizar estado:', jasmine.any(Error));
  });

  it('debe manejar currentUserEmail null en toggleUserStatus', () => {
    component.currentUserEmail = null;
    const userToToggle: User = {
      id: '2',
      name: 'Ana',
      email: 'ana@mail.com',
      rol: 'AGENT',
      active: true,
    };
  
    mockUserService.update.and.returnValue(of(userToToggle));
  
    component.toggleUserStatus(userToToggle);
  
    expect(mockUserService.update).toHaveBeenCalled();
    expect(mockMessageService.add).not.toHaveBeenCalledWith(jasmine.objectContaining({
      detail: 'No puedes cambiar el estado de tu propio usuario',
    }));
  });

  it('debe manejar currentUserEmail null', () => {
    component.currentUserEmail = null;
    
    component.deleteUser(user);

    expect(mockConfirmationService.confirm).toHaveBeenCalled();
    expect(mockMessageService.add).not.toHaveBeenCalledWith(jasmine.objectContaining({
      detail: 'No puedes eliminar tu propio usuario',
    }));
  });

  it('debe obtener etiqueta de rol correctamente', () => {
    expect(component.getRoleLabel('ADMIN')).toBe('Administrador');
    expect(component.getRoleLabel('REVIEWER')).toBe('Revisor');
    expect(component.getRoleLabel('AGENT')).toBe('Agente');
    expect(component.getRoleLabel('UNKNOWN_ROLE')).toBe('UNKNOWN_ROLE');
  });

  it('debe abrir modal de vista de usuario', () => {
    const userToView: User = {
      id: '1',
      name: 'Juan',
      email: 'juan@mail.com',
      rol: 'ADMIN',
      active: true,
    };

    component.viewUser(userToView);

    expect(component.selectedUser).toBe(userToView);
    expect(component.displayViewModal).toBeTrue();
  });

  it('debe filtrar usuarios por email', () => {
    component.users = [...mockUsers];
    component.searchQuery = 'ana@mail.com';
    component.applyFilters();

    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].email).toBe('ana@mail.com');
  });

  it('debe filtrar usuarios por nombre y email combinados', () => {
    const extendedUsers = [
      ...mockUsers,
      { id: '3', name: 'Juan Carlos', email: 'juan.carlos@mail.com', rol: 'AGENT', active: true }
    ];
    component.users = extendedUsers;
    component.searchQuery = 'juan';
    component.applyFilters();

    expect(component.filteredUsers.length).toBe(2);
    expect(component.filteredUsers.some(u => u.name === 'Juan')).toBeTrue();
    expect(component.filteredUsers.some(u => u.name === 'Juan Carlos')).toBeTrue();
  });

  it('debe filtrar usuarios con múltiples criterios', () => {
    const extendedUsers = [
      ...mockUsers,
      { id: '3', name: 'Carlos', email: 'carlos@mail.com', rol: 'ADMIN', active: false }
    ];
    component.users = extendedUsers;
    component.searchQuery = 'carlos';
    component.selectedRole = 'ADMIN';
    component.selectedStatus = false;
    component.applyFilters();

    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].name).toBe('Carlos');
    expect(component.filteredUsers[0].rol).toBe('ADMIN');
    expect(component.filteredUsers[0].active).toBeFalse();
  });

  it('debe manejar búsqueda con caracteres especiales', () => {
    const usersWithSpecialChars = [
      { id: '1', name: 'José María', email: 'jose.maria@mail.com', rol: 'ADMIN', active: true },
      { id: '2', name: 'Ana-Luisa', email: 'ana.luisa@mail.com', rol: 'AGENT', active: true }
    ];
    component.users = usersWithSpecialChars;
    component.searchQuery = 'josé';
    component.applyFilters();

    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].name).toBe('José María');
  });

  it('debe manejar búsqueda case-insensitive', () => {
    component.users = [...mockUsers];
    component.searchQuery = 'JUAN';
    component.applyFilters();

    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].name).toBe('Juan');
  });

  it('debe inicializar menuItems correctamente', () => {
    component.users = [...mockUsers];
    component.initializeMenuItems();

    expect(component.menuItems['1']).toBeDefined();
    expect(component.menuItems['2']).toBeDefined();
    expect(component.menuItems['1'].length).toBe(3);
    expect(component.menuItems['1'][0].label).toBe('Ver');
    expect(component.menuItems['1'][1].label).toBe('Editar');
    expect(component.menuItems['1'][2].label).toBe('Eliminar');
  });

  it('debe manejar error al actualizar usuario', fakeAsync(() => {
    const errorResponse = { error: { message: 'Error al actualizar' } };
    mockUserService.update.and.returnValue(throwError(() => errorResponse));

    component.usuario = { ...mockUsers[0], name: 'Usuario Actualizado' };
    component.guardarUsuario();
    tick();

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error al actualizar'
    });
  }));
});