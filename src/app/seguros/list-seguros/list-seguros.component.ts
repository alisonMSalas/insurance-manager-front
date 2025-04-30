import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Insurance } from '../../shared/interfaces/insurance';
import { SegurosService } from '../service/seguros.service';
import { getInsuranceTypeLabel, getPaymentPeriodLabel } from '../../shared/utils/insurance.utils';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../../shared/interfaces/error-response';

@Component({
  selector: 'app-list-seguros',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, ToastModule],
  providers: [MessageService],
  templateUrl: './list-seguros.component.html',
  styleUrls: ['./list-seguros.component.css']
})
export class ListSegurosComponent implements OnInit {
  insurances: Insurance[] = [];

  constructor(
    private segurosService: SegurosService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.loadInsurances();
  }

  loadInsurances(): void {
    this.segurosService.getAll().subscribe({
      next: (data: Insurance[]) => {
        this.insurances = data.sort((a, b) => {
          if (a.active === b.active) {
            return (a.id || '').localeCompare(b.id || '');
          }
          return a.active ? -1 : 1;
        });
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error);
      }
    });
  }

  changeStatus(insurance: Insurance): void {
    this.segurosService.updateStatus(insurance.id!, !insurance.active).subscribe({
      next: () => {
        this.loadInsurances();
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Estado actualizado correctamente'
        });
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error);
      }
    });
  }

  deleteInsurance(insurance: Insurance): void {
    this.segurosService.delete(insurance.id!).subscribe({
      next: () => {
        this.loadInsurances();
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Seguro eliminado correctamente'
        });
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error);
      }
    });
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.error && typeof error.error === 'object') {
      const errorResponse = error.error as ErrorResponse;
      if (errorResponse.message) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorResponse.message
        });
        return;
      }
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error en el servidor'
    });
  }

  getInsuranceTypeLabel = getInsuranceTypeLabel;
  getPaymentPeriodLabel = getPaymentPeriodLabel;
}