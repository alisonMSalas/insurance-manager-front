import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ContratacionesService } from '../../core/services/contrataciones.service';
import { ClientsService } from '../../core/services/clients.service';
import { Contract } from '../../shared/interfaces/contract';
import { Client } from '../../shared/interfaces/client';
import { Insurance } from '../../shared/interfaces/insurance';
import { formatDate } from '@angular/common';
import { forkJoin, Observable } from 'rxjs';
import { SegurosService } from '../service/seguros.service';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
@Component({
  selector: 'app-contrataciones-listado',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule, ToastModule, ChipModule, DividerModule],
  templateUrl: './contrataciones-listado.component.html',
  styleUrls: ['./contrataciones-listado.component.scss'],
  providers: [MessageService]
})
export class ContratacionesListadoComponent implements OnInit {
  private contratacionesService = inject(ContratacionesService);
  private clientsService = inject(ClientsService);
  private segurosService = inject(SegurosService);
  private messageService = inject(MessageService);
  contratos: Contract[] = [];
  userRole: string | null = null;

  ngOnInit(): void {
    this.userRole = this.getUserRole();
    if (this.userRole === 'ADMIN' || this.userRole === 'AGENT') {
      this.cargarContrataciones();
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acceso Denegado',
        detail: 'No tienes permisos para ver las contrataciones.'
      });
    }
  }

  cargarContrataciones(): void {
    this.contratacionesService.getAll().subscribe({
      next: (contratos) => {
        const observables: Observable<[Client, Insurance]>[] = contratos.map(contrato =>
          forkJoin([
            this.clientsService.getById(contrato.clientId!),
            this.segurosService.getById(contrato.insuranceId!)
          ])
        );
        forkJoin(observables).subscribe({
          next: (results) => {
            this.contratos = contratos.map((contrato, index) => ({
              ...contrato,
              isActive: contrato.status === 'ACTIVE',
              client: results[index][0], // <-- Cliente completo
              insurance: {
                ...results[index][1], // <-- Seguro completo
                benefits: contrato.insurance?.benefits ?? [] // si necesitas asegurar esto
              },
              totalPaymentAmount: contrato.totalPaymentAmount ?? 0,
              beneficiaries: contrato.beneficiaries ?? []
            }));

          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudieron cargar los datos de clientes o seguros.'
            });
            console.error('Error al cargar datos adicionales:', err);
          }
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las contrataciones.'
        });
        console.error('Error al cargar contrataciones:', err);
      }
    });
  }
  formatBeneficiaries(beneficiaries: { name: string; lastName: string }[] | undefined): string {
    if (!beneficiaries || beneficiaries.length === 0) {
      return '-';
    }
    return beneficiaries.map(b => `${b.name} ${b.lastName}`).join(', ');
  }

  desactivarContrato(contrato: Contract): void {
    if (this.userRole !== 'ADMIN' && this.userRole !== 'AGENT') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acceso Denegado',
        detail: 'No tienes permisos para desactivar contratos.'
      });
      return;
    }


  }

  formatFecha(fecha: string | undefined): string {
    if (!fecha) return '-';
    return formatDate(fecha, 'dd/MM/yyyy', 'en-US');
  }

  canCreateContract(): boolean {
    return ['ADMIN', 'AGENT', 'CLIENT'].includes(this.userRole || '');
  }

  canViewContracts(): boolean {
    return ['ADMIN', 'AGENT'].includes(this.userRole || '');
  }

  canDeactivateContract(): boolean {
    return ['ADMIN', 'AGENT'].includes(this.userRole || '');
  }

  private getUserRole(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch (e) {
      console.error('Token inválido:', e);
      return null;
    }
  }
  formatStatus(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'APPROVED': return 'Aprobado';
      case 'REJECTED': return 'Rechazado';
      case 'REQUESTED': return 'Solicitado';
      case 'ACTIVE': return 'Activo';
      default: return status;
    }
  }

onEliminar(contrato: any) {
  // Lógica para eliminar el contrato, posiblemente con confirmación
}


}