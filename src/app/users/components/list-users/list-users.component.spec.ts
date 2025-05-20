import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ListUsersComponent } from './list-users.component';
import { UsersService, User } from '../../../core/services/users.service';
import { ApiClientService } from '../../../core/api/httpclient';
import { of, throwError } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';

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

it('debería llamar a delete y mostrar mensaje éxito cuando se acepta la confirmación', () => {
  const user: User = { id: "1", name: 'Juan', email: 'juan@test.com', rol: 'ADMIN', active: true };
  
  component.currentUserEmail = 'otro@test.com'; // para que no bloquee la eliminación
  
  // Mock del delete para emitir valor y que next se ejecute
  mockUserService.delete.and.returnValue(of(void 0));
  
  // Espía para verificar que se recarguen los usuarios
  const loadUsersSpy = spyOn(component, 'loadUsers');
  
  // Simular confirmación con llamada a accept()
  mockConfirmationService.confirm.and.callFake((options: any) => {
    options.accept();
    return mockConfirmationService; // importante retornar algo para evitar error TS
  });
  
  // Ejecutar método
  component.deleteUser(user);
  
  // Comprobar que se llamó al servicio delete con el id correcto
  expect(mockUserService.delete).toHaveBeenCalledWith(user.id);
  
  // Comprobar que se mostró el mensaje de éxito
  expect(mockMessageService.add).toHaveBeenCalledWith({
    severity: 'success',
    summary: 'Éxito',
    detail: 'Usuario eliminado correctamente',
  });
  
  // Comprobar que se volvió a cargar la lista de usuarios
  expect(loadUsersSpy).toHaveBeenCalled();
});
it('debería mostrar mensaje de error si delete falla', fakeAsync(() => {
  const user: User = { id: "1", name: 'Juan', email: 'juan@test.com', rol: 'ADMIN', active: true };

  component.currentUserEmail = 'otro@test.com'; // para evitar bloqueo

  // Mock delete para que emita error
  mockUserService.delete.and.returnValue(throwError(() => new Error('Error de prueba')));

  // Mock confirm para llamar a accept()
  mockConfirmationService.confirm.and.callFake((options: any) => {
    options.accept();
    return mockConfirmationService;
  });

  // Espiar console.error para que no contamine salida
  spyOn(console, 'error');

  // Ejecutar método
  component.deleteUser(user);

  // Avanzar tiempo para resolver suscripción
  tick();

  // Expectativas
  expect(mockUserService.delete).toHaveBeenCalledWith(user.id);
  expect(mockMessageService.add).toHaveBeenCalledWith({
    severity: 'error',
    summary: 'Error',
    detail: 'No se pudo eliminar el usuario',
  });
  expect(console.error).toHaveBeenCalled();
}));
it('debería crear usuario correctamente cuando modo es "crear"', fakeAsync(() => {
    component.modo = 'crear';
    component.usuario = { name: 'Juan', email: 'juan@test.com', rol: 'ADMIN', password: '1234' };

    mockUserService.create.and.returnValue(of({})); // simular éxito
    spyOn(component, 'loadUsers'); // para verificar que se llama

    component.guardarUsuario();
    tick();

    expect(mockUserService.create).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'Juan',
      email: 'juan@test.com',
      rol: 'ADMIN',
      password: '1234',
    }));

    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Usuario creado correctamente',
    }));

    expect(component.mostrarModal).toBe(false);
    expect(component.loadUsers).toHaveBeenCalled();
  }));

  it('debería manejar error al crear usuario', fakeAsync(() => {
    component.modo = 'crear';
    component.usuario = { name: 'Juan', email: 'juan@test.com', rol: 'ADMIN', password: '1234' };

    mockUserService.create.and.returnValue(throwError(() => new Error('Error al crear')));
    component.guardarUsuario();
    tick();

    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo crear el usuario',
    }));

    expect(console.error).toHaveBeenCalled();
  }));
it('debería actualizar usuario correctamente cuando modo es distinto de "crear"', fakeAsync(() => {
    component.modo = 'editar'; // o cualquier string que no sea 'crear'
    component.usuario = { id:" 1", name: 'Ana', email: 'ana@test.com', rol: 'USER' };

    mockUserService.update.and.returnValue(of({}));
    spyOn(component, 'loadUsers');

    component.guardarUsuario();
    tick();

    expect(mockUserService.update).toHaveBeenCalledWith(jasmine.objectContaining({
      id: 1,
      name: 'Ana',
      email: 'ana@test.com',
      rol: 'USER',
    }));

    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Usuario actualizado correctamente',
    }));

    expect(component.mostrarModal).toBe(false);
    expect(component.loadUsers).toHaveBeenCalled();
  }));

  it('debería manejar error al actualizar usuario', fakeAsync(() => {
    component.modo = 'editar';
    component.usuario = { id: "1", name: 'Ana', email: 'ana@test.com', rol: 'USER' };

    mockUserService.update.and.returnValue(throwError(() => new Error('Error al actualizar')));

    component.guardarUsuario();
    tick();

    expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo actualizar el usuario',
    }));

    expect(console.error).toHaveBeenCalledWith('Error al actualizar usuario:', jasmine.any(Error));
  }));

  it('debería eliminar usuario y mostrar mensaje éxito', fakeAsync(() => {
  component.currentUserEmail = 'otro@correo.com'; // para que no sea el mismo usuario
  mockUserService.delete.and.returnValue(of({}));
  mockConfirmationService.confirm.and.callFake((options: any) => {
    options.accept();
    return mockConfirmationService;  // <--- importante retornar el mock
  });
  spyOn(component, 'loadUsers');

  component.deleteUser(user);
  tick();

  expect(mockUserService.delete).toHaveBeenCalledWith(user.id);
  expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
    severity: 'success',
    summary: 'Éxito',
    detail: 'Usuario eliminado correctamente',
  }));
  expect(component.loadUsers).toHaveBeenCalled();
}));

it('debería manejar error al eliminar usuario', fakeAsync(() => {
  spyOn(console, 'error'); // Evitar que error ensucie consola
  component.currentUserEmail = 'otro@correo.com';
  const error = new Error('Error al eliminar');

  mockUserService.delete.and.returnValue(throwError(() => error));
  mockConfirmationService.confirm.and.callFake((options: any) => {
    options.accept();
    return mockConfirmationService;  // <--- retornar mock
  });

  component.deleteUser(user);
  tick();

  expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
    severity: 'error',
    summary: 'Error',
    detail: 'No se pudo eliminar el usuario',
  }));
  expect(console.error).toHaveBeenCalledWith('Error al eliminar usuario:', error);
}));

it('no debería permitir eliminar el propio usuario', () => {
  component.currentUserEmail = user.email;

  component.deleteUser(user);

  expect(mockMessageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
    severity: 'error',
    summary: 'Error',
    detail: 'No puedes eliminar tu propio usuario',
  }));
  expect(mockConfirmationService.confirm).not.toHaveBeenCalled();
  expect(mockUserService.delete).not.toHaveBeenCalled();
});

});