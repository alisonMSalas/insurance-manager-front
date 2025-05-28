import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Insurance, InsuranceType, PaymentPeriod } from '../../shared/interfaces/insurance';
import { SegurosService } from '../service/seguros.service';
import { getInsuranceTypeLabel, getPaymentPeriodLabel, getPaymentPeriodOptions, getInsuranceTypeOptions } from '../../shared/utils/insurance.utils';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../../shared/interfaces/error-response';
import { DialogModule } from 'primeng/dialog';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';

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
    DialogModule,
    CheckboxModule,
    DropdownModule,
    InputTextModule,
    TextareaModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    ConfirmDialogModule,
    TooltipModule,
    DividerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './list-seguros.component.html',
  styleUrls: ['./list-seguros.component.scss']
})

export class ListSegurosComponent implements OnInit {
  insurances: Insurance[] = [];
  display=false;
  isEditing: boolean = false;
  currentInsuranceId: string | null = null;
  displayViewModal = false;
  selectedInsurance: Insurance | null = null;
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
  openViewModal(insurance: Insurance) {
    this.selectedInsurance = insurance;
    this.displayViewModal = true;
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

   handleError(error: HttpErrorResponse): void {
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

  insurance: Omit<Insurance, 'id'> = {
    name: '',
    type: InsuranceType.HEALTH, 
    description: '',
    coverage: 0, 
    deductible: 0, 
    paymentAmount: 0, 
    paymentPeriod: PaymentPeriod.MONTHLY, 
    active: false,
  };
  
  insuranceTypes = getInsuranceTypeOptions();
  
  paymentPeriods = getPaymentPeriodOptions();
  
  saveInsurance() {
    if (this.isEditing && this.currentInsuranceId) {
      // Lógica de actualización
      const updatedInsurance: Insurance = {
        ...this.insurance,
        id: this.currentInsuranceId
      };
      
      this.segurosService.update(this.currentInsuranceId,updatedInsurance).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Seguro actualizado correctamente'
          });
          this.loadInsurances();
          this.display = false;
          this.resetCampos();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error);
        }
      });
    } else {
      // Lógica de creación (existente)
      this.segurosService.save(this.insurance).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Seguro registrado correctamente'
          });
          this.loadInsurances();
          this.display = false;
          this.resetCampos();
        },
        error: (error: HttpErrorResponse) => {
          this.handleError(error);
        }
      });
    }
  }
  openModal(insuranceToEdit?: Insurance) {
    this.isEditing = !!insuranceToEdit;
    
    if (this.isEditing && insuranceToEdit) {
      this.currentInsuranceId = insuranceToEdit.id || null;
      // Copiar los datos del seguro a editar
      this.insurance = {
        name: insuranceToEdit.name,
        type: insuranceToEdit.type,
        description: insuranceToEdit.description,
        coverage: insuranceToEdit.coverage,
        deductible: insuranceToEdit.deductible,
        paymentAmount: insuranceToEdit.paymentAmount,
        paymentPeriod: insuranceToEdit.paymentPeriod,
        active: insuranceToEdit.active || false
      };
    } else {
      this.resetCampos();
      this.currentInsuranceId = null;
    }
    
    this.display = true;
  }

  resetCampos() {
    this.insurance = {
      name: '',
      type: InsuranceType.HEALTH, // Valor por defecto del enum
      description: '',
      coverage: 0,
      deductible: 0,
      paymentAmount: 0,
      paymentPeriod: PaymentPeriod.MONTHLY, // Valor por defecto del enum
      active: false,
    };
  }

  preventNegativeInput(event: KeyboardEvent): void {
    if (event.key === '-' || event.key === 'e') {
      event.preventDefault();
    }
  }
}