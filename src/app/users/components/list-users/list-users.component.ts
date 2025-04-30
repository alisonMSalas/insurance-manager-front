import { Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown'; // Cambiado de SelectModule a DropdownModule
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UsersService, User } from '../../../core/services/users.service';
import { ApiClientService } from '../../../core/api/httpclient';

@Component({
  standalone: true,
  selector: 'app-list-users',
  imports: [
    TableModule,
    ButtonModule,
    CommonModule,
    ToggleSwitchModule,
    FormsModule,
    FloatLabelModule,
    InputTextModule,
    DropdownModule, // Usar DropdownModule para p-dropdown
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.css'],
})
export class ListUsersComponent {
  users: User[] = [];
  filteredUsers: User[] = [];
  currentUserEmail: string | null = null;
  userService = inject(UsersService);
  apiClientService = inject(ApiClientService);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);

  mostrarModal: boolean = false;
  modo: 'crear' | 'editar' = 'crear';
  usuario: Partial<User> & { password?: string } = {
    name: '',
    email: '',
    rol: '',
    password: '',
    active: true,
  };

  roles = [
    { codigo: 'ADMIN', nombre: 'Administrador' },
    { codigo: 'REVIEWER', nombre: 'Revisor' },
    { codigo: 'AGENT', nombre: 'Agente' },
    { codigo: 'CLIENTE', nombre: 'Cliente' },
  ];

  // Nueva propiedad para las opciones del dropdown de roles
  roleOptions: { label: string; value: string | null }[] = [
    { label: 'Todos los roles', value: null },
    ...this.roles.map((r) => ({ label: r.nombre, value: r.codigo })),
  ];

  statusOptions: { label: string; value: boolean | null }[] = [
    { label: 'Todos los estados', value: null },
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false },
  ];

  searchQuery: string = '';
  selectedRole: string | null = null;
  selectedStatus: boolean | null = null;

  ngOnInit(): void {
    this.currentUserEmail = this.apiClientService.getCurrentUserEmail();
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: (users: User[]) => {
        this.users = users;
        this.filteredUsers = users;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los usuarios',
        });
      },
    });
  }

  applyFilters() {
    this.filteredUsers = this.users.filter((user) => {
      const matchesSearch =
        this.searchQuery === '' ||
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesRole = !this.selectedRole || user.rol === this.selectedRole;
      const matchesStatus = this.selectedStatus === null || user.active === this.selectedStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  onSearchChange(event: Event) {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  onRoleChange(event: any) {
    this.selectedRole = event.value;
    this.applyFilters();
  }

  onStatusChange(event: any) {
    this.selectedStatus = event.value;
    this.applyFilters();
  }

  deleteUser(user: User) {
    if (this.currentUserEmail && user.email === this.currentUserEmail) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No puedes eliminar tu propio usuario',
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar al usuario ${user.name}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.delete(user.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Usuario eliminado correctamente',
            });
            this.loadUsers();
          },
          error: (err) => {
            console.error('Error al eliminar usuario:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el usuario',
            });
          },
        });
      },
    });
  }

  abrirModalCrear() {
    this.modo = 'crear';
    this.usuario = { name: '', email: '', rol: '', password: '', active: true };
    this.mostrarModal = true;
  }

  abrirModalEditar(user: User) {
    this.modo = 'editar';
    this.usuario = { ...user, password: '' };
    this.mostrarModal = true;
  }

  guardarUsuario() {
    if (!this.usuario.name || !this.usuario.email || !this.usuario.rol) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor, completa todos los campos requeridos',
      });
      return;
    }

    if (this.modo === 'crear' && !this.usuario.password) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La contraseña es requerida para crear un usuario',
      });
      return;
    }

    const userPayload = {
      ...this.usuario,
      password: this.modo === 'crear' ? this.usuario.password : undefined,
    };

    if (this.modo === 'crear') {
      this.userService.create(userPayload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Usuario creado correctamente',
          });
          this.mostrarModal = false;
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error al crear usuario:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el usuario',
          });
        },
      });
    } else {
      this.userService.update(userPayload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Usuario actualizado correctamente',
          });
          this.mostrarModal = false;
          this.loadUsers();
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el usuario',
          });
        },
      });
    }
  }

  viewUser(user: User) {
    console.log('Ver usuario:', user);
    this.messageService.add({
      severity: 'info',
      summary: 'Información',
      detail: `Visualizando usuario: ${user.name}`,
    });
  }

  toggleUserStatus(user: User) {
    if (this.currentUserEmail && user.email === this.currentUserEmail) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No puedes cambiar el estado de tu propio usuario',
      });
      user.active = !user.active; // Revertir cambio
      return;
    }

    this.userService.update({ ...user }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Usuario ${user.active ? 'activado' : 'desactivado'} correctamente`,
        });
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        user.active = !user.active; // Revertir cambio
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el estado del usuario',
        });
      },
    });
  }
}