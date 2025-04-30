import { Component, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabel, FloatLabelModule } from 'primeng/floatlabel';
import { UsersService } from '../../../core/services/users.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';


interface User {
  id: string;
  name: string;
  email: string;
  rol: string;
  active: boolean;
}
@Component({
  standalone: true,
  selector: 'app-list-users',
  imports: [TableModule, ButtonModule, CommonModule, ToggleSwitchModule, FormsModule, SelectModule, FloatLabel, InputTextModule, DialogModule, ToastModule, ConfirmDialogModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.css'],
})
export class ListUsersComponent {
  users: User[] = [];
  currentUser: User | null = null;
  userService = inject(UsersService);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);

  ngOnInit(): void {
    this.loadUsers();
    this.getCurrentUser();
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: (users: User[]) => {
        this.users = users;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los usuarios'
        });
      },
    });
  }

  getCurrentUser() {
    // Aquí deberías obtener el usuario actual de tu servicio de autenticación
    // Por ahora lo simulamos con el primer usuario
    this.userService.getCurrentUser().subscribe({
      next: (user: User) => {
        this.currentUser = user;
      },
      error: (err) => {
        console.error('Error fetching current user:', err);
      }
    });
  }

  deleteUser(user: User) {
    if (this.currentUser && user.id === this.currentUser.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No puedes eliminar tu propio usuario'
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
              detail: 'Usuario eliminado correctamente'
            });
            this.loadUsers();
          },
          error: (err) => {
            console.error('Error deleting user:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el usuario'
            });
          }
        });
      }
    });
  }
  mostrarModal: boolean = false;

  nuevoUsuario = {
    nombre: '',
    email: ''
  };

  roles: any[] = [
    { codigo: 'ADMIN', nombre: 'Administrador' },
    { codigo: 'REVIEWER', nombre: 'Revisor' },
    { codigo: 'AGENT', nombre: 'Agente' },
    { codigo: 'CLIENTE', nombre: 'Cliente' }
  ];


  viewUser(user: User) {
    console.log('Ver usuario:', user);
  }


}
