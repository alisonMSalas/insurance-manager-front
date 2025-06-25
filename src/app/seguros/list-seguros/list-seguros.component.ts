import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { PickListModule, PickListMoveToSourceEvent, PickListMoveToTargetEvent } from 'primeng/picklist';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { Benefit } from '../../shared/interfaces/benefit';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';

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
    DividerModule,
    PickListModule, MultiSelectModule, InputNumberModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './list-seguros.component.html',
  styleUrls: ['./list-seguros.component.scss']
})

export class ListSegurosComponent implements OnInit {
  insurances: Insurance[] = [];
  display = false;
  isEditing: boolean = false;
  currentInsuranceId: string | null = null;
  displayViewModal = false;
  selectedInsurance: Insurance | null = null;
  filteredInsurances: Insurance[] = [];
  loading = false;
  allBenefits: Benefit[] = [];
  submitted: boolean = false;

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
  selectedBenefits!: Benefit[];
  availableBenefits!: Benefit[];

  constructor(
    private segurosService: SegurosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadInsurances();
    this.getBenefits();
  }

  refreshData(): void {
    this.loading = true;
    this.loadInsurances();
    this.getBenefits();
  }

  onMoveToTarget(event: PickListMoveToTargetEvent): void {
    const newItems = event.items.filter(
      item => !this.selectedBenefits.some(b => b.id === item.id)
    );
    this.selectedBenefits.push(...newItems);
    this.availableBenefits = this.availableBenefits.filter(
      item => !newItems.some(n => n.id === item.id)
    );
  }

  onMoveToSource(event: PickListMoveToSourceEvent): void {
    const movedIds = event.items.map(item => item.id);
    this.availableBenefits.push(...event.items);
    this.selectedBenefits = this.selectedBenefits.filter(
      item => !movedIds.includes(item.id)
    );
  }

  verBeneficiosSeleccionados() {
    console.log('Beneficios seleccionados:', this.selectedBenefits);
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
    coverage: null,
    deductible: null,
    paymentAmount: null,
    paymentPeriod: PaymentPeriod.MONTHLY,
    active: false,
  };

  insuranceTypes = getInsuranceTypeOptions();
  paymentPeriods = getPaymentPeriodOptions();

  saveInsurance() {
    this.submitted = true;
    if (
      !this.insurance.name ||
      !this.insurance.type ||
      !this.insurance.description ||
      this.insurance.coverage == null ||
      this.insurance.deductible == null ||
      this.insurance.paymentAmount == null ||
      !this.insurance.paymentPeriod ||
      !this.selectedBenefits || this.selectedBenefits.length === 0
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos obligatorios',
        detail: 'Por favor, complete todos los campos requeridos y seleccione al menos un beneficio.'
      });
      return;
    }
    console.log('benefits seleccionados:', this.selectedBenefits);
    this.insurance.benefits = [...this.selectedBenefits];
    console.log('cambios de beneficios', this.insurance.benefits);
    if (this.isEditing && this.currentInsuranceId) {
      // Lógica de actualización
      const updatedInsurance: Insurance = {
        ...this.insurance,
        id: this.currentInsuranceId
      };

      this.segurosService.update(this.currentInsuranceId, updatedInsurance).subscribe({
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
          console.log('Seguro registrado:', response);
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
      this.selectedBenefits = [...(insuranceToEdit.benefits || [])];

      this.availableBenefits = this.allBenefits.filter(
        b => !this.selectedBenefits.some(sb => sb.id === b.id)
      );

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
    }

    this.display = true;
    this.cdr.detectChanges(); // Asegura que el modal actualice la vista
  }

  eliminarBeneficioDesdePickList(benefit: Benefit): void {
    // Mover el beneficio de selectedBenefits a availableBenefits
    this.selectedBenefits = this.selectedBenefits.filter(b => b.id !== benefit.id);
    this.availableBenefits.push(benefit);

    // Forzar detección de cambios si es necesario
    this.cdr.detectChanges();
  }




  resetCampos() {
    this.insurance = {
      name: '',
      type: InsuranceType.HEALTH,
      description: '',
      coverage: null,
      deductible: null,
      paymentAmount: null,
      paymentPeriod: PaymentPeriod.MONTHLY,
      active: false,
    };
    this.selectedBenefits = [];
    this.getBenefits();
    this.submitted = false;
  }

  preventNegativeInput(event: KeyboardEvent): void {
    if (event.key === '-' || event.key === 'e') {
      event.preventDefault();
    }
  }

  // En tu componente
  // availableBenefits: any[] = [
  //   { 
  //     id: 1, 
  //     name: 'Cobertura Dental', 
  //     description: 'Incluye limpiezas, extracciones y tratamientos básicos' 
  //   },
  //   { 
  //     id: 2, 
  //     name: 'Cobertura Visual', 
  //     description: 'Exámenes de la vista y descuentos en lentes' 
  //   },
  //   { 
  //     id: 3, 
  //     name: 'Medicina General', 
  //     description: 'Consultas con médicos generales y especialistas' 
  //   },
  //   { 
  //     id: 4, 
  //     name: 'Hospitalización', 
  //     description: 'Cobertura por días de hospitalización' 
  //   },
  //   { 
  //     id: 5, 
  //     name: 'Medicamentos', 
  //     description: 'Descuentos en medicamentos recetados' 
  //   },
  //   { 
  //     id: 6, 
  //     name: 'Emergencias', 
  //     description: 'Cobertura en casos de emergencia médica' 
  //   }
  // ];

  getBenefits(): void {
    this.segurosService.getAllBenefits().subscribe({
      next: (benefits: Benefit[]) => {
        this.allBenefits = benefits;
        if (!this.isEditing) {
          // Solo al crear, carga toda la lista
          this.availableBenefits = [...benefits];
        }
      },
      error: (error: HttpErrorResponse) => {
        this.handleError(error);
      }
    });
  }
  onInputLengthLimit(event: any, maxLength: number) {
    const inputValue = event.target.value;
    if (inputValue.length > maxLength) {
      // Trunca el valor a maxLength
      event.target.value = inputValue.slice(0, maxLength);
      // Actualiza el ngModel si es necesario
      this.insurance.coverage = +event.target.value;
    }
  }
  


}