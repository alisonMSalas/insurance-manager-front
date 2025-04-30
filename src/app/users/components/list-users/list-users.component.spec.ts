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
    spyOn(localStorage, 'getItem').and.returnValue(null);
  
    mockUserService = jasmine.createSpyObj<UsersService>('UsersService', ['getAll', 'create', 'update', 'delete']);
    mockApiClientService = jasmine.createSpyObj<ApiClientService>('ApiClientService', ['getCurrentUserEmail']);
    mockConfirmationService = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm']);
    mockMessageService = jasmine.createSpyObj<MessageService>('MessageService', ['add']);
    mockUserService.getAll.and.returnValue(of(mockUsers));
    await TestBed.configureTestingModule({
      imports: [ListUsersComponent], 
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
  
    spyOn(component.messageService, 'add'); 
  
    component.guardarUsuario();
  
    expect(component.messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Por favor, completa todos los campos requeridos',
    });
  });
  
  it('debe mostrar error si no se pueden cargar los usuarios', () => {
    mockUserService.getAll.and.returnValue(throwError(() => new Error('Error al cargar usuarios')));
  
    spyOn(component.messageService, 'add'); 
  
    component.loadUsers();
  
    expect(component.messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los usuarios',
    });
  });
  it('debe mostrar error si intenta eliminar su propio usuario', () => {
    component.currentUserEmail = 'juan@mail.com';
  
    const userToDelete: User = { email: 'juan@mail.com', name: 'Juan', id: '1' } as User;
  
    spyOn(component.messageService, 'add'); 
  
    component.deleteUser(userToDelete);
  
    expect(component.messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No puedes eliminar tu propio usuario',
    });
  });
  it('debe mostrar error si la contraseña está vacía al crear un usuario', () => {
    const userToCreate: User = {
      id: '3',
      name: 'Nuevo Usuario',
      email: 'nuevo@example.com',
      rol: 'ADMIN',
    
      active: true,
    };
  

    component.modo = 'crear';
    component.usuario = { ...userToCreate };
  
    spyOn(component.messageService, 'add');
  
    component.guardarUsuario();
  
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
  
    spyOn(component.messageService, 'add'); 
  
    component.viewUser(user);
  
    const consoleSpy = spyOn(console, 'log');
    component.viewUser(user);
    expect(consoleSpy).toHaveBeenCalledWith('Ver usuario:', user);
  
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
    expect(user.active).toBe(false); 
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
      active: false, 
    }));
    expect(component.messageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Usuario desactivado correctamente',
    });
    expect(user.active).toBe(false); 
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
    spyOn(console, 'error'); 
    mockUserService.update.and.returnValue(throwError(() => new Error('Error al actualizar')));
  
    component.toggleUserStatus(user);
    tick();
  
    expect(mockUserService.update).toHaveBeenCalledWith(jasmine.objectContaining({
      id: user.id,
      name: user.name,
      email: user.email,
      rol: user.rol,
      active: false, 
    }));
    expect(component.messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar el estado del usuario',
    });
    expect(user.active).toBe(true); 
  }));
});