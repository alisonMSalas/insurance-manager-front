import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { ClientsService } from '../../core/services/clients.service';
import { Client } from '../../shared/interfaces/client';
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password';
import { User } from '../../core/services/users.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-list-clients',
  imports: [
    CommonModule,
    ToastModule,
    TableModule,
    FloatLabelModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ToggleSwitchModule,
    DialogModule,
    TagModule,
    DropdownModule,
    PasswordModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './list-clients.component.html',
  styleUrls: ['./list-clients.component.css'],
})
export class ListClientsComponent {
  clientes: Client[] = [];
  clientService = inject(ClientsService);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);
  today: Date = new Date();
  modoEdicion: boolean = false;
  filtroCedula: string = '';
  clientesOriginales: Client[] = [];
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
  passwordOriginal: string = '';
  displayModal: boolean = false;
  displayDetailModal: boolean = false;
  clienteSeleccionado: Client | null = null;

  ngOnInit(): void {
    this.obtenerClientes();
  }

  // Restrict input to numbers only and update the model
  restrictToNumbers(event: Event, client: any, field: string): void {
    const input = event.target as HTMLInputElement;
    const cleanValue = input.value.replace(/[^0-9]/g, ''); // Remove non-digits
    client[field] = cleanValue; // Update model
    input.value = cleanValue; // Update input field
  }

  // Reload clients from service
  private reloadClientes(): void {
    this.clientService.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.clientesOriginales = data;
        this.filtrarClientes(); // Reapply filter if any
      },
      error: (err) => {
        console.error('Error al recargar clientes:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron recargar los clientes.',
        });
      },
    });
  }

  // Validate form fields programmatically
  validateForm(): boolean {
    const cliente = this.nuevoCliente;
    const user = cliente.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight

    // Check name
    if (!cliente.name || cliente.name.trim().length < 2) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El nombre es requerido y debe tener al menos 2 caracteres.',
      });
      return false;
    }

    // Check lastName
    if (!cliente.lastName || cliente.lastName.trim().length < 2) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El apellido es requerido y debe tener al menos 2 caracteres.',
      });
      return false;
    }

    // Check identificationNumber (exactly 10 digits)
    if (!cliente.identificationNumber || !/^[0-9]{10}$/.test(cliente.identificationNumber)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El número de identificación debe tener exactamente 10 dígitos y no puede contener letras ni signos.',
      });
      return false;
    }

    // Check birthDate (not in the future)
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

    // Check phoneNumber (exactly 10 digits)
    if (!cliente.phoneNumber || !/^[0-9]{10}$/.test(cliente.phoneNumber)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El teléfono debe tener exactamente 10 dígitos y no puede contener letras ni signos.',
      });
      return false;
    }

    // Check address
    if (!cliente.address || cliente.address.trim().length < 5) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La dirección es requerida y debe tener al menos 5 caracteres.',
      });
      return false;
    }

    // Check gender
    if (!cliente.gender) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El género es requerido.',
      });
      return false;
    }

    // Check occupation
    if (!cliente.occupation || cliente.occupation.trim().length < 2) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La ocupación es requerida y debe tener al menos 2 caracteres.',
      });
      return false;
    }

    // Check email
    if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El correo electrónico es requerido y debe ser válido.',
      });
      return false;
    }

    // Check password (required for new clients, optional for edit but must be valid if provided)
    if (!this.modoEdicion && (!user.password || !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(user.password))) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La contraseña es requerida y debe tener al menos 8 caracteres, incluyendo letras y números.',
      });
      return false;
    }
    if (this.modoEdicion && user.password && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(user.password)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La nueva contraseña debe tener al menos 8 caracteres, incluyendo letras y números.',
      });
      return false;
    }

    return true;
  }

  filtrarClientes(): void {
    const filtro = this.filtroCedula.trim().toLowerCase();
    if (!filtro) {
      this.clientes = [...this.clientesOriginales];
    } else {
      this.clientes = this.clientesOriginales.filter((cliente) =>
        cliente.identificationNumber.toLowerCase().includes(filtro)
      );
    }
  }

  toggleClientStatus(cliente: Client): void {
    this.clientService.update({ ...cliente }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: `Cliente ${cliente.active ? 'activado' : 'desactivado'} correctamente`,
        });
        this.reloadClientes(); // Reload to avoid duplication
      },
      error: (err) => {
        console.error('Error al actualizar estado del cliente:', err);
        cliente.active = !cliente.active; // Revert change
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el estado del cliente',
        });
      },
    });
  }

  obtenerClientes(): void {
    this.clientService.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        this.clientesOriginales = data;
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

  guardarClienteNuevo(): void {
    if (!this.validateForm()) return;

    this.nuevoCliente.user.name = this.nuevoCliente.name + ' ' + this.nuevoCliente.lastName;

    this.clientService.create(this.nuevoCliente).subscribe({
      next: () => {
        this.displayModal = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Cliente creado',
          detail: 'El cliente se registró correctamente.',
        });
        this.reloadClientes(); 
      },
      error: (error) => {
        if (error.status === 412 && error.error && error.error.message) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error al crear cliente',
            detail: error.error.message,
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Ocurrió un error inesperado.',
          });
        }
      },
    });
  }

  actualizarCliente(): void {
    if (!this.validateForm()) return;

    this.nuevoCliente.user.name = this.nuevoCliente.name + ' ' + this.nuevoCliente.lastName;

    // If password is empty in edit mode, remove it from the payload to avoid sending an empty password
    const payload = { ...this.nuevoCliente };
    if (this.modoEdicion && !payload.user.password) {
      delete payload.user.password;
    }

    this.clientService.update(payload).subscribe({
      next: () => {
        this.displayModal = false;
        this.modoEdicion = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Cliente actualizado',
          detail: 'Los datos del cliente se actualizaron correctamente.',
        });
        this.reloadClientes(); // Reload to avoid duplication
      },
      error: (err) => {
        console.error('Error al actualizar cliente:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el cliente.',
        });
      },
    });
  }

  eliminarCliente(id: string): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar este cliente?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.clientService.delete(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Cliente eliminado',
              detail: 'El cliente se eliminó correctamente.',
            });
            this.reloadClientes(); // Reload to avoid duplication
          },
          error: (err) => {
            console.error('Error al eliminar cliente:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar el cliente.',
            });
          },
        });
      },
    });
  }

  abrirModal(cliente?: Client): void {
    if (cliente) {
      this.nuevoCliente = JSON.parse(JSON.stringify(cliente));
      this.nuevoCliente.user.password = ''; 
      this.modoEdicion = true;
    } else {
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
      this.modoEdicion = false;
    }
    this.displayModal = true;
  }

  cerrar(): void {
    this.displayModal = false;
  }

  verDetalleCliente(cliente: Client): void {
    this.clienteSeleccionado = cliente;
    this.displayDetailModal = true;
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
}