// reportes.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { ContratacionesService } from '../core/services/contrataciones.service';
import { Contract } from '../shared/interfaces/contract';
import { get } from 'http';
import { ClientContracts } from '../shared/interfaces/clientContract';
import { ChipModule } from 'primeng/chip';
import { Dialog, DialogModule } from 'primeng/dialog';
import { CLIENT_RENEG_LIMIT } from 'tls';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    AvatarModule,
    ButtonModule,
    TagModule,
    RippleModule, DividerModule, ChipModule, DialogModule
  ],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent {
  contractsService = inject(ContratacionesService);
  unpaidContracts: Contract[] = [];
  unpaidContractscount = 0;
  expiringSoonContracts: Contract[] = [];
  expiringSoonContractsCount = 0;
  expiredContracts: Contract[] = [];
  expiredContractsCount = 0;
  pendingContracts: Contract[] = [];
  pendingContractsCount = 0;
  groupedContracts: ClientContracts[] = [];
  groupedContractsCount = 0;

  reporteSeleccionado: string = ''; // tipo de tarjeta seleccionada
  reportesFiltrados: any[] = [];    // reportes a mostrar
  contratosFiltrados: any[] = [];
  modalVisible = false;
  clienteSeleccionado: ClientContracts | null = null;

  tarjetas: any[] = [];

  ngOnInit(): void {
    this.getUnpaidContracts();
    this.getContractsExpiringSoon();
    this.getExpiredContracts();
    this.getPendingContracts();
    this.getContractsGroupedByClient();

    setTimeout(() => {
      this.cargarVistaPrevia();
    }, 500);
  }

  cargarVistaPrevia() {
    this.contratosFiltrados = [
      ...this.unpaidContracts.slice(0, 2),
      ...this.expiringSoonContracts.slice(0, 2),
      ...this.expiredContracts.slice(0, 2),
      ...this.pendingContracts.slice(0, 2)
    ];
  }

  seleccionarTarjeta(tarjeta: any) {
    if (this.reporteSeleccionado === tarjeta.titulo) {
      this.reporteSeleccionado = '';
      this.cargarVistaPrevia();
      this.modalVisible = false;
      this.clienteSeleccionado = null;
      return;
    }

    this.reporteSeleccionado = tarjeta.titulo;
    this.modalVisible = false;
    this.clienteSeleccionado = null;

    switch (tarjeta.titulo) {
      case 'Seguros Impagos':
        this.contratosFiltrados = this.unpaidContracts;
        break;
      case 'Contratos por Vencer':
        this.contratosFiltrados = this.expiringSoonContracts;
        break;
      case 'Contratos Vencidos':
        this.contratosFiltrados = this.expiredContracts;
        break;
      case 'Solicitudes Pendientes':
        this.contratosFiltrados = this.pendingContracts;
        break;
      case 'Contratos por Cliente':
        this.contratosFiltrados = this.groupedContracts;
        break;
      default:
        this.cargarVistaPrevia();
    }
  }

  getUnpaidContracts() {
    this.contractsService.getUnpaidContracts().subscribe((contracts) => {
      this.unpaidContracts = contracts;
      this.unpaidContractscount = contracts.length;

      this.cargarTarjetas();
    });
  }

  getContractsExpiringSoon() {
    this.contractsService.getExpiringSoonContracts().subscribe((contracts) => {
      this.expiringSoonContracts = contracts;
      this.expiringSoonContractsCount = contracts.length;

      this.cargarTarjetas();
    });
  }

  getExpiredContracts() {
    this.contractsService.getExpiredContracts().subscribe((contracts) => {
      this.expiredContracts = contracts;
      this.expiredContractsCount = contracts.length;

      this.cargarTarjetas();
    });
  }

  getPendingContracts() {
    this.contractsService.getPendingContracts().subscribe((contracts) => {
      this.pendingContracts = contracts;
      this.pendingContractsCount = contracts.length;

      this.cargarTarjetas();
    });
  }

  getContractsGroupedByClient() {
    this.contractsService.getContractsGroupedByClient().subscribe((grouped) => {
      this.groupedContracts = grouped;
      this.groupedContractsCount = grouped.length;

      this.cargarTarjetas();
    });
  }

  abrirPdfContrato(contractId: string) {
    this.contractsService.getContractPdf(contractId).subscribe(contractFile => {
      const byteCharacters = atob(contractFile.content);
      const byteArray = new Uint8Array([...byteCharacters].map(c => c.charCodeAt(0)));
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url);
    });
  }

  base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let i = 0; i < byteCharacters.length; i += 512) {
      const slice = byteCharacters.slice(i, i + 512);
      const byteNumbers = new Array(slice.length);
      for (let j = 0; j < slice.length; j++) {
        byteNumbers[j] = slice.charCodeAt(j);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }




  cargarTarjetas() {
    this.tarjetas = [
      {
        titulo: 'Seguros Impagos',
        descripcion: 'Pólizas con pagos pendientes o atrasados',
        cantidad: this.unpaidContractscount,
        icono: 'pi pi-exclamation-circle',
        colorFondo: 'success',
        colorIcono: 'success',
        fecha: 'Actualizado hace 2 horas'
      },
      {
        titulo: 'Contratos por Vencer',
        descripcion: 'Contratos que expirarán en los próximos 15 días',
        cantidad: this.expiringSoonContractsCount,
        icono: 'pi pi-clock',
        colorFondo: 'warning',
        colorIcono: 'warning',
        fecha: 'Actualizado hoy'
      },
      {
        titulo: 'Contratos Vencidos',
        descripcion: 'Contratos que ya han expirado sin renovación',
        cantidad: this.expiredContractsCount,
        icono: 'pi pi-calendar-times',
        colorFondo: 'danger',
        colorIcono: 'danger',
        fecha: 'Actualizado hoy'
      },
      {
        titulo: 'Contratos por Cliente',
        descripcion: 'Resumen de contratos agrupados por cliente',
        cantidad: this.groupedContractsCount,
        icono: 'pi pi-users',
        colorFondo: 'accent',
        colorIcono: 'accent',
        fecha: 'Actualizado ayer'
      },
      {
        titulo: 'Solicitudes Pendientes',
        descripcion: 'Solicitudes de clientes pendientes de revisión',
        cantidad: this.pendingContractsCount,
        icono: 'pi pi-inbox',
        color: 'primary',
        fecha: 'Actualizado hace 30 min'
      }
    ];
  }
  abrirModalCliente(cliente: ClientContracts) {
    this.clienteSeleccionado = cliente;
    this.modalVisible = true;
  }

  // Método para cerrar modal
  cerrarModal() {
    this.modalVisible = false;
    this.clienteSeleccionado = null;
  }




  obtenerClaseEstado(estado: string): string {
    if (estado.toLowerCase().includes('pendiente')) return 'warning';
    if (estado.toLowerCase().includes('urgente')) return 'danger';
    if (estado.toLowerCase().includes('completado')) return 'success';
    return 'info';
  }

  formatFecha(fecha: string | Date): string {
    return fecha ? new Date(fecha).toLocaleDateString() : '-';
  }

  formatStatus(status: string): string {
    return status?.toUpperCase() || 'DESCONOCIDO';
  }

  formatBeneficiaries(beneficiarios: any[]): string {
    return beneficiarios?.length ? beneficiarios.map(b => b.name).join(', ') : '-';
  }

}
