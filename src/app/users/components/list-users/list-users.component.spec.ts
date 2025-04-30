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
    mockUserService = jasmine.createSpyObj<UsersService>('UsersService', ['getAll', 'create', 'update', 'delete']);
    mockApiClientService = jasmine.createSpyObj<ApiClientService>('ApiClientService', ['getCurrentUserEmail']);
    mockConfirmationService = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', ['confirm']);
    mockMessageService = jasmine.createSpyObj<MessageService>('MessageService', ['add']);

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

  it('debe evitar eliminar el usuario actual', () => {
    component.currentUserEmail = 'juan@mail.com';
    const user = mockUsers[0];

    component.deleteUser(user);

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No puedes eliminar tu propio usuario',
    });
    expect(mockConfirmationService.confirm).not.toHaveBeenCalled();
  });

  it('debe llamar a create si está en modo crear y los campos están completos', fakeAsync(() => {
    component.modo = 'crear';
    component.usuario = {
      name: 'Nuevo',
      email: 'nuevo@mail.com',
      rol: 'AGENT',
      password: '1234',
      active: true,
    };

    mockUserService.create.and.returnValue(of({}));
    mockUserService.getAll.and.returnValue(of(mockUsers)); // Mock getAll to prevent undefined

    component.guardarUsuario();
    tick();

    expect(mockUserService.create).toHaveBeenCalledWith({
      name: 'Nuevo',
      email: 'nuevo@mail.com',
      rol: 'AGENT',
      password: '1234',
      active: true,
    });
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Usuario creado correctamente',
    });
    expect(component.mostrarModal).toBeFalse();
    expect(mockUserService.getAll).toHaveBeenCalled();
  }));

  it('debe manejar errores al cargar usuarios', fakeAsync(() => {
    mockUserService.getAll.and.returnValue(throwError(() => new Error('Carga fallida')));
    mockApiClientService.getCurrentUserEmail.and.returnValue('otro@mail.com');

    fixture.detectChanges(); // Trigger ngOnInit
    tick(); // Ensure async operations complete

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudieron cargar los usuarios',
    });
  }));
});