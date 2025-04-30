import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListUsersComponent } from './list-users.component';
import { UsersService } from '../../../core/services/users.service';
import { ApiClientService } from '../../../core/api/httpclient';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { User } from '../../../core/services/users.service';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';

describe('ListUsersComponent', () => {
  let component: ListUsersComponent;
  let fixture: ComponentFixture<ListUsersComponent>;
  let usersServiceSpy: jasmine.SpyObj<UsersService>;
  let apiClientServiceSpy: jasmine.SpyObj<ApiClientService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;
  let confirmationServiceSpy: jasmine.SpyObj<ConfirmationService>;

  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Usuario 1',
      email: 'usuario1@test.com',
      rol: 'ADMIN',
      active: true
    },
    {
      id: '2',
      name: 'Usuario 2',
      email: 'usuario2@test.com',
      rol: 'USER',
      active: false
    }
  ];

  beforeEach(async () => {
    const usersSpy = jasmine.createSpyObj('UsersService', ['getAll', 'create', 'update', 'delete']);
    const apiSpy = jasmine.createSpyObj('ApiClientService', ['getCurrentUserEmail']);
    const messageSpy = jasmine.createSpyObj('MessageService', ['add']);
    const confirmSpy = jasmine.createSpyObj('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [
        ListUsersComponent,
        FormsModule,
        TableModule,
        ButtonModule,
        ToggleSwitchModule,
        DropdownModule,
        DialogModule,
        ToastModule,
        ConfirmDialogModule,
        InputTextModule
      ],
      providers: [
        { provide: UsersService, useValue: usersSpy },
        { provide: ApiClientService, useValue: apiSpy },
        { provide: MessageService, useValue: messageSpy },
        { provide: ConfirmationService, useValue: confirmSpy }
      ]
    }).compileComponents();

    usersServiceSpy = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
    apiClientServiceSpy = TestBed.inject(ApiClientService) as jasmine.SpyObj<ApiClientService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    confirmationServiceSpy = TestBed.inject(ConfirmationService) as jasmine.SpyObj<ConfirmationService>;

    fixture = TestBed.createComponent(ListUsersComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load users and set current user email', () => {
      usersServiceSpy.getAll.and.returnValue(of(mockUsers));
      apiClientServiceSpy.getCurrentUserEmail.and.returnValue('current@test.com');

      component.ngOnInit();

      expect(usersServiceSpy.getAll).toHaveBeenCalled();
      expect(component.users).toEqual(mockUsers);
      expect(component.filteredUsers).toEqual(mockUsers);
      expect(component.currentUserEmail).toBe('current@test.com');
    });

    it('should handle error when loading users', () => {
      usersServiceSpy.getAll.and.returnValue(throwError(() => new Error('Error loading users')));

      component.ngOnInit();

      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los usuarios'
      });
    });
  });

  describe('applyFilters', () => {
    beforeEach(() => {
      component.users = mockUsers;
      component.filteredUsers = mockUsers;
    });

    it('should filter users by search query', () => {
      component.searchQuery = 'Usuario 1';
      component.applyFilters();
      expect(component.filteredUsers.length).toBe(1);
      expect(component.filteredUsers[0].name).toBe('Usuario 1');
    });

    it('should filter users by role', () => {
      component.selectedRole = 'ADMIN';
      component.applyFilters();
      expect(component.filteredUsers.length).toBe(1);
      expect(component.filteredUsers[0].rol).toBe('ADMIN');
    });

    it('should filter users by status', () => {
      component.selectedStatus = true;
      component.applyFilters();
      expect(component.filteredUsers.length).toBe(1);
      expect(component.filteredUsers[0].active).toBe(true);
    });
  });

  describe('deleteUser', () => {
    it('should not allow deleting own user', () => {
      component.currentUserEmail = 'usuario1@test.com';
      component.deleteUser(mockUsers[0]);

      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No puedes eliminar tu propio usuario'
      });
      expect(usersServiceSpy.delete).not.toHaveBeenCalled();
    });

    it('should show confirmation dialog before deleting', () => {
      component.currentUserEmail = 'other@test.com';
      usersServiceSpy.delete.and.returnValue(of(void 0));

      component.deleteUser(mockUsers[0]);

      expect(confirmationServiceSpy.confirm).toHaveBeenCalled();
    });
  });

  describe('guardarUsuario', () => {
    it('should validate required fields', () => {
      component.usuario = { name: '', email: '', rol: '', active: true };
      component.guardarUsuario();

      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, completa todos los campos requeridos'
      });
    });

    it('should require password for new users', () => {
      component.modo = 'crear';
      component.usuario = { name: 'Test', email: 'test@test.com', rol: 'USER', active: true };
      component.guardarUsuario();

      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'La contraseña es requerida para crear un usuario'
      });
    });

    it('should create new user successfully', () => {
      component.modo = 'crear';
      component.usuario = {
        name: 'Test',
        email: 'test@test.com',
        rol: 'USER',
        password: 'password123',
        active: true
      };
      usersServiceSpy.create.and.returnValue(of(void 0));

      component.guardarUsuario();

      expect(usersServiceSpy.create).toHaveBeenCalled();
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Usuario creado correctamente'
      });
    });
  });

  describe('toggleUserStatus', () => {
    it('should not allow toggling own user status', () => {
      component.currentUserEmail = 'usuario1@test.com';
      const user = { ...mockUsers[0] };
      
      component.toggleUserStatus(user);

      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No puedes cambiar el estado de tu propio usuario'
      });
      expect(usersServiceSpy.update).not.toHaveBeenCalled();
    });

    it('should update user status successfully', () => {
      component.currentUserEmail = 'other@test.com';
      const user = { ...mockUsers[0] };
      usersServiceSpy.update.and.returnValue(of(void 0));

      component.toggleUserStatus(user);

      expect(usersServiceSpy.update).toHaveBeenCalled();
      expect(messageServiceSpy.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Usuario activado correctamente'
      });
    });
  });
});
