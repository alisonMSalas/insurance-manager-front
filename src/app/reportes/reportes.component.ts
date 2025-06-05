// reportes.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';

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
  user = {
    nombre: 'María González',
    rol: 'Administrador',
    imagen: 'https://randomuser.me/api/portraits/women/44.jpg'
  };

  tarjetas = [
    {
      titulo: 'Seguros Impagos',
      descripcion: 'Pólizas con pagos pendientes o atrasados',
      cantidad: 24,
      icono: 'pi pi-exclamation-circle',
      colorFondo: 'success',
      colorIcono: 'success',
      fecha: 'Actualizado hace 2 horas'
    },
    {
      titulo: 'Contratos por Vencer',
      descripcion: 'Contratos que expirarán en los próximos 30 días',
      cantidad: 15,
      icono: 'pi pi-clock',
      colorFondo: 'warning',
      colorIcono: 'warning',
      fecha: 'Actualizado hoy'
    },
    {
      titulo: 'Contratos Vencidos',
      descripcion: 'Contratos que ya han expirado sin renovación',
      cantidad: 8,
      icono: 'pi pi-calendar-times',
      colorFondo: 'danger',
      colorIcono: 'danger',
      fecha: 'Actualizado hoy'
    },
    {
      titulo: 'Contratos por Cliente',
      descripcion: 'Resumen de contratos agrupados por cliente',
      cantidad: 42,
      icono: 'pi pi-users',
      colorFondo: 'accent',
      colorIcono: 'accent',
      fecha: 'Actualizado ayer'
    },
    {
      titulo: 'Solicitudes Pendientes',
      descripcion: 'Solicitudes de clientes pendientes de revisión',
      cantidad: 11,
      icono: 'pi pi-inbox',
      color: 'primary',
      fecha: 'Actualizado hace 30 min'
    }
  ];

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
