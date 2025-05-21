import { Component,inject } from '@angular/core';
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
  imports: [CommonModule,ToastModule,TableModule,FloatLabelModule,FormsModule,ButtonModule, 
    InputTextModule,ToggleSwitchModule,DialogModule,TagModule,
    DropdownModule,PasswordModule,ConfirmDialogModule],
  providers: [MessageService,ConfirmationService],
  templateUrl: './list-clients.component.html',
  styleUrl: './list-clients.component.css'
})
export class ListClientsComponent {
  clientes: Client[] = [];
  clientService= inject(ClientsService);
  confirmationService= inject(ConfirmationService);
  messageService= inject(MessageService);
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
  phoneNumber: 0,
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
    password: '',  // agregamos password opcional aquí
  }
};

passwordOriginal: string = '';

  displayModal: boolean = false;

  cerrar() {
    this.displayModal = false;
  }

  abrir() {
    this.displayModal = true;
  }
clienteSeleccionado: any = null;
displayDetailModal: boolean = false;

ngOnInit(): void {
    this.obtenerClientes();
  }

  filtrarClientes(): void {
  const filtro = this.filtroCedula.trim().toLowerCase();
  if (!filtro) {
    this.clientes = [...this.clientesOriginales]; // restaurar todo
  } else {
    this.clientes = this.clientesOriginales.filter(cliente =>
      cliente.identificationNumber.toLowerCase().includes(filtro)
    );
  }
}




toggleClientStatus(cliente: Client) {


  this.clientService.update({ ...cliente }).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: `Cliente ${cliente.active ? 'activado' : 'desactivado'} correctamente`,
      });
    },
    error: (err) => {
      console.error('Error al actualizar estado del cliente:', err);
      cliente.active = !cliente.active; // Revertir cambio
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
      }
    });
  }

guardarClienteNuevo() {
  if (!this.nuevoCliente) return;

  this.nuevoCliente.user.name = `${this.nuevoCliente.name} ${this.nuevoCliente.lastName}`;

 this.clientService.create(this.nuevoCliente).subscribe({
    next: (clienteCreado) => {
      this.clientes.push(clienteCreado);
      this.displayModal = false;
      this.messageService.add({ severity: 'success', summary: 'Cliente creado', detail: 'El cliente se registró correctamente.' });
    },
     error: (error) => {
    if (error.status === 412 && error.error && error.error.message) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error al crear cliente',
        detail: error.error.message
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Ocurrió un error inesperado.'
      });
    }
  }
});
}


  verDetalleCliente(cliente: Client): void {
    console.log('Ver detalle:', cliente);
    this.clienteSeleccionado = cliente;
   this.displayDetailModal= true;
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
          this.clientes = this.clientes.filter(c => c.id !== id);
        },
        error: (err) => {
          console.error('Error al eliminar cliente:', err);
        }
      });
    }
  });
}

  abrirModal(cliente?: Client) {
  if (cliente) {
    this.nuevoCliente = JSON.parse(JSON.stringify(cliente)); // Clonamos para evitar editar el original directamente
    this.modoEdicion = true;
  } else {
    this.nuevoCliente = {
      id: '',
      name: '',
      lastName: '',
      identificationNumber: '',
      birthDate: '',
      phoneNumber: 0,
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
      }
    };
    this.modoEdicion = false;
  }

  this.displayModal = true;
}



actualizarCliente() {
  if (!this.nuevoCliente) return;
 
  this.nuevoCliente.user.name = `${this.nuevoCliente.name} ${this.nuevoCliente.lastName}`;

 this.clientService.update(this.nuevoCliente).subscribe({
    next: (clienteActualizado) => {
      const index = this.clientes.findIndex(c => c.id === clienteActualizado.id);
      if (index !== -1) this.clientes[index] = clienteActualizado;

      this.displayModal = false;
      this.modoEdicion = false;
      this.messageService.add({ severity: 'success', summary: 'Cliente actualizado', detail: 'Los datos del cliente se actualizaron correctamente.' });
    },
    error: (err) => {
      console.error('Error al actualizar cliente:', err);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el cliente.' });
    }
  });

}

cerrarModal() {
  this.displayModal = false;
}

handleClienteCreado(clienteCreado: Client) {
  this.displayModal = false;
  this.clientes.push(clienteCreado);
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
