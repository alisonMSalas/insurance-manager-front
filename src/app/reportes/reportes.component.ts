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
    RippleModule, DividerModule
  ],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent {
  contractsService = inject(ContratacionesService);
  unpaidContracts:Contract[] = [];
  unpaidContractscount = 0;
  expiringSoonContracts: Contract[] = [];
  expiringSoonContractsCount = 0;
  expiredContracts: Contract[] = [];
  expiredContractsCount = 0;
  pendingContracts: Contract[] = [];
  pendingContractsCount = 0;
  groupedContracts: ClientContracts[] = [];
  groupedContractsCount = 0;

  user = {
    nombre: 'María González',
    rol: 'Administrador',
    imagen: 'https://randomuser.me/api/portraits/women/44.jpg'
  };

  tarjetas: any[] = [];

  ngOnInit(): void {
    this.getUnpaidContracts();
    this.getContractsExpiringSoon();
    this.getExpiredContracts();
    this.getPendingContracts();
    this.getContractsGroupedByClient();
  }

  getUnpaidContracts(){
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

  

  reportes = [
    {
      id: '#REP-2023-045',
      tipo: 'Seguros Impagos',
      fecha: '15/05/2023',
      registros: 24,
      estado: 'Pendiente revisión'
    },
    {
      id: '#REP-2023-044',
      tipo: 'Contratos por Vencer',
      fecha: '14/05/2023',
      registros: 15,
      estado: 'Completado'
    },
    {
      id: '#REP-2023-043',
      tipo: 'Contratos Vencidos',
      fecha: '13/05/2023',
      registros: 8,
      estado: 'Urgente'
    },
    {
      id: '#REP-2023-042',
      tipo: 'Contratos por Cliente',
      fecha: '12/05/2023',
      registros: 42,
      estado: 'Completado'
    }
  ];

  obtenerClaseEstado(estado: string): string {
    if (estado.toLowerCase().includes('pendiente')) return 'warning';
    if (estado.toLowerCase().includes('urgente')) return 'danger';
    if (estado.toLowerCase().includes('completado')) return 'success';
    return 'info';
  }
}
