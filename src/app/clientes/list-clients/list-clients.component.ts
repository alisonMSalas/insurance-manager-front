import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ClientsService } from '../../core/services/clients.service';
import { Client } from '../../shared/interfaces/client';
import { ApiClientService } from '../../core/api/httpclient';
import { User } from '../../core/services/users.service';
import {Tooltip} from 'primeng/tooltip';

@Component({
  selector: 'app-list-clients',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    DropdownModule,
    FloatLabelModule,
    InputTextModule,
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
    DividerModule,
    MenuModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './list-clients.component.html',
  styleUrls: ['./list-clients.component.scss'],
})
export class ListClientsComponent {
  clientes: Client[] = [];
  currentUserEmail: string | null = null;
  clientService = inject(ClientsService);
  apiClientService = inject(ApiClientService);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);
  loading = false;

  @ViewChild('menu') menu: any;

  mostrarModal: boolean = false;
  displayViewModal: boolean = false;
  clienteSeleccionado: Client | null = null;
  modo: 'crear' | 'editar' = 'crear';
  filtroCedula: string = '';
  today: Date = new Date();
  nuevoCliente: Client & { user: Partial<User> & { password?: string } } = {
    id: '',
    name: '',
    lastName: '',
    identificationNumber: '',
    birthDate: '',
    phoneNumber: '',
    address: '',
    gender: '',
    occupation: '',
    active: true,
    user: {
      id: '',
      name: '',
      email: '',
      rol: 'CLIENT',
      active: true,
      password: '',
    },
  };
  menuItems: { [key: string]: MenuItem[] } = {};

  ngOnInit(): void {
    this.currentUserEmail = this.apiClientService.getCurrentUserEmail();
    this.obtenerClientes();
  }

  obtenerClientes(): void {
    this.clientService.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.initializeMenuItems();
        this.filtrarClientes();
      },
      error: (err) => {
        console.error('Error al obtener clientes:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los clientes.',
        });
      },
    });
  }

  initializeMenuItems(): void {
    this.menuItems = {};
    this.clientes.forEach((cliente) => {
      const clientId = cliente.id;
      this.menuItems[clientId] = [
        {
          label: 'Ver',
          icon: 'pi pi-eye',
          command: () => this.verDetalleCliente(clientId),
          styleClass: 'view',
        },
        {
          label: 'Editar',
          icon: 'pi pi-pencil',
          command: () => this.abrirModalEditar(clientId),
          styleClass: 'edit',
        },
        {
          label: 'Eliminar',
          icon: 'pi pi-trash',
          command: () => this.eliminarCliente(clientId),
          styleClass: 'delete',
        },
      ];
    });
  }

  filtrarClientes(): void {
    const filtro = this.filtroCedula.trim().toLowerCase();
    this.clientes = this.clientes.filter((cliente) =>
      filtro === '' || cliente.identificationNumber.toLowerCase().includes(filtro)
    );
  }

  restrictToNumbers(event: Event, client: any, field: string): void {
    const input = event.target as HTMLInputElement;
    const cleanValue = input.value.replace(/[^0-9]/g, '');
    client[field] = cleanValue;
    input.value = cleanValue;
  }

  toggleClientStatus(cliente: Client): void {
    if (this.currentUserEmail && cliente.user.email === this.currentUserEmail) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No puedes cambiar el estado de tu propio cliente',
      });
      cliente.active = !cliente.active; // Revert change
      return;
    }

    this.clientService.update({ ...cliente }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Cliente ${cliente.active ? 'activado' : 'desactivado'} correctamente`,
        });
        this.obtenerClientes();
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        cliente.active = !cliente.active; // Revert change
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el estado del cliente',
        });
      },
    });
  }

  abrirModalCrear(): void {
    this.modo = 'crear';
    this.nuevoCliente = {
      id: '',
      name: '',
      lastName: '',
      identificationNumber: '',
      birthDate: '',
      phoneNumber: '',
      address: '',
      gender: '',
      occupation: '',
      active: true,
      user: {
        id: '',
        name: '',
        email: '',
        rol: 'CLIENT',
        active: true,
        password: '',
      },
    };
    this.mostrarModal = true;
  }

  abrirModalEditar(clientId: string): void {
    const cliente = this.clientes.find((c) => c.id === clientId);
    if (!cliente) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cliente no encontrado',
      });
      return;
    }
    this.modo = 'editar';
    this.nuevoCliente = JSON.parse(JSON.stringify(cliente));
    this.nuevoCliente.user.password = '';
    this.mostrarModal = true;
  }

  guardarCliente(): void {
    if (!this.validateForm()) return;

    this.nuevoCliente.user.name = this.nuevoCliente.name + ' ' + this.nuevoCliente.lastName;

    const payload = { ...this.nuevoCliente };
    if (this.modo === 'editar' && !payload.user.password) {
      delete payload.user.password;
    }

    if (this.modo === 'crear') {
      this.clientService.create(payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cliente creado correctamente',
          });
          this.mostrarModal = false;
          this.obtenerClientes();
        },
        error: (err) => {
          console.error('Error al crear cliente:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || err?.error?.detail || 'No se pudo crear el cliente',
          });
        },
      });
    } else {
      this.clientService.update(payload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cliente actualizado correctamente',
          });
          this.mostrarModal = false;
          this.obtenerClientes();
        },
        error: (err) => {
          console.error('Error al actualizar cliente:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || err?.error?.detail || 'No se pudo actualizar el cliente',
          });
        },
      });
    }
  }

  eliminarCliente(clientId: string): void {
    const cliente = this.clientes.find((c) => c.id === clientId);
    if (!cliente) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cliente no encontrado',
      });
      return;
    }

    if (this.currentUserEmail && cliente.user.email === this.currentUserEmail) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No puedes eliminar tu propio cliente',
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar al cliente ${cliente.name} ${cliente.lastName}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.clientService.delete(clientId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Cliente eliminado correctamente',
            });
            this.obtenerClientes();
          },
          error: (err) => {
            console.error('Error al eliminar cliente:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err?.error?.message || err?.error?.detail || 'No se pudo eliminar el cliente',
            });
          },
        });
      },
    });
  }

  verDetalleCliente(clientId: string): void {
    const cliente = this.clientes.find((c) => c.id === clientId);
    if (!cliente) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Cliente no encontrado',
      });
      return;
    }
    this.clienteSeleccionado = cliente;
    this.displayViewModal = true;
  }

  validateForm(): boolean {
    const cliente = this.nuevoCliente;
    const user = cliente.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!cliente.name || cliente.name.trim().length < 2) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El nombre es requerido y debe tener al menos 2 caracteres.',
      });
      return false;
    }

    if (!cliente.lastName || cliente.lastName.trim().length < 2) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El apellido es requerido y debe tener al menos 2 caracteres.',
      });
      return false;
    }

    if (!cliente.identificationNumber || !/^[0-9]{10}$/.test(cliente.identificationNumber)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El número de identificación debe tener exactamente 10 dígitos.',
      });
      return false;
    }

    if (!cliente.birthDate) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La fecha de nacimiento es requerida.',
      });
      return false;
    }
    const birthDate = new Date(cliente.birthDate);
    if (birthDate > today) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La fecha de nacimiento no puede ser futura.',
      });
      return false;
    }

    if (!cliente.phoneNumber || !/^[0-9]{10}$/.test(cliente.phoneNumber)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El teléfono debe tener exactamente 10 dígitos.',
      });
      return false;
    }

    if (!cliente.address || cliente.address.trim().length < 5) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La dirección es requerida y debe tener al menos 5 caracteres.',
      });
      return false;
    }

    if (!cliente.gender) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El género es requerido.',
      });
      return false;
    }

    if (!cliente.occupation || cliente.occupation.trim().length < 2) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La ocupación es requerida y debe tener al menos 2 caracteres.',
      });
      return false;
    }

    if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El correo electrónico es requerido y debe ser válido.',
      });
      return false;
    }

    return true;
  }

  calcularEdad(fechaNacimiento: string | undefined): number | string {
    if (!fechaNacimiento) return '';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  }

  showActionsMenu(event: Event, cliente: Client): void {
    this.menu.toggle(event);
  }

  refreshData() {
    this.loading = true;
    this.obtenerClientes()
  }
}
