import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Insurance, InsuranceType } from '../../shared/interfaces/insurance';
import { SegurosService } from '../service/seguros.service';
import { getInsuranceTypeLabel, getInsuranceTypeOptions, getPaymentPeriodLabel } from '../../shared/utils/insurance.utils';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../../shared/interfaces/error-response';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';

interface StatusOption {
  label: string;
  value: boolean | null;
}

@Component({
  selector: 'app-list-seguros',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    ToastModule,
    SelectModule,
    FormsModule,
    ConfirmDialogModule,
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './list-seguros.component.html',
  styleUrls: ['./list-seguros.component.css']
})
export class ListSegurosComponent implements OnInit {
  insurances: Insurance[] = [];
  filteredInsurances: Insurance[] = [];
  loading = false;

  statusOptions: StatusOption[] = [
    { label: 'Todos', value: null },
    { label: 'Activos', value: true },
    { label: 'Inactivos', value: false }
  ];

  typeOptions = getInsuranceTypeOptions();
  typeOptionsWithAll = [
    { label: 'Todos', value: null },
    ...this.typeOptions
  ];

  selectedStatus: boolean | null = null;
  selectedType: string | null = null;

  constructor(
    private segurosService: SegurosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.loadInsurances();
  }

  refreshData(): void {
    this.loading = true;
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
        this.applyFilters();
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredInsurances = this.insurances.filter(insurance => {
      const statusMatch = this.selectedStatus === null || insurance.active === this.selectedStatus;
      const typeMatch = this.selectedType === null || insurance.type === this.selectedType;
      return statusMatch && typeMatch;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
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
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar el seguro ${insurance.name}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
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