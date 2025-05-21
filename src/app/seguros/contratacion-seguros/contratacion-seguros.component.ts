import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { FluidModule } from 'primeng/fluid';
import { InputNumber } from 'primeng/inputnumber';
import { validarCedulaEcuatoriana } from '../../shared/utils/cedula.util';
import { CalendarModule } from 'primeng/calendar';
import { FileUploadModule } from 'primeng/fileupload';
import { SegurosService } from '../service/seguros.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ClientsService } from '../../core/services/clients.service';
import { formatDate } from '@angular/common';
import { ContratacionesService } from '../../core/services/contrataciones.service';
import { Contract } from '../../shared/interfaces/contract';
import { firstValueFrom } from 'rxjs';

interface DocumentoRequerido {
  nombre: string;
  requisitos: string;
  archivo?: File;
  error?: string;
}
@Component({
  selector: 'app-contratacion-seguros',
  standalone: true,
  imports: [
    TabsModule,
    RouterModule,
    CommonModule,
    DropdownModule,
    FormsModule,
    TabViewModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule, DatePickerModule, FluidModule, CalendarModule, FileUploadModule, ToastModule
  ],
  templateUrl: './contratacion-seguros.component.html',
  styleUrls: ['./contratacion-seguros.component.css'],
  providers: [MessageService]
})
export class ContratacionSegurosComponent {
  private segurosService = inject(SegurosService);
  private messageService = inject(MessageService);
  private clientService = inject(ClientsService);
  private contractService = inject(ContratacionesService);
  clienteForm: FormGroup;
  coberturasForm: FormGroup;
  pagoForm: FormGroup;
  documentosForm: FormGroup;

  tiposSeguro: any[] = [];
  uploadedFiles: File[] = [];
  mostrarError: boolean = false;
  clienteEncontrado: boolean = false;

  beneficiarios = [
    { nombre: '', parentesco: '', porcentaje: 100 }
  ];

  tabs = [
    { route: 'dashboard', label: 'Datos del Cliente', icon: 'pi pi-home' },
    { route: 'transactions', label: 'Transactions', icon: 'pi pi-chart-line' },
    { route: 'products', label: 'Products', icon: 'pi pi-list' },
    { route: 'messages', label: 'Messages', icon: 'pi pi-inbox' }
  ];

  activeIndex = 0;

  tiposPago = [
    { label: 'Efectivo', value: 'efectivo' },
    { label: 'Tarjeta de Crédito', value: 'tarjeta' },
    { label: 'Transferencia', value: 'transferencia' }
  ];

  parentescos = [
    { label: 'Cónyuge', value: 'conyuge' },
    { label: 'Hijo/a', value: 'hijo' },
    { label: 'Padre', value: 'padre' },
    { label: 'Madre', value: 'madre' },
    { label: 'Hermano/a', value: 'hermano' },
    { label: 'Otro', value: 'otro' }
  ];

  periodicidades = [
    { label: 'Mensual', value: 'mensual' },
    { label: 'Trimestral', value: 'trimestral' },
    { label: 'Anual', value: 'anual' }
  ];

  tiposDocumentos = [
    { label: 'Cédula', value: 'cedula' },
    { label: 'Pasaporte', value: 'pasaporte' },
    { label: 'RUC', value: 'ruc' }
  ];

  resumen = {
    tipoSeguroSeleccionado: null
  };

  constructor(private fb: FormBuilder) {
    this.clienteForm = this.fb.group({
      buscar: ['', [Validators.required, validarCedulaEcuatoriana()]],
      tipoDocumento: [null],
      cedula: ['', [Validators.required, validarCedulaEcuatoriana()]],
      nombres: [''],
      apellidos: [''],
      fechaNacimiento: [null],
      genero: [''],
      telefono: [''],
      correo: [''],
      ocupacion: [''],
      direccion: [''],
    });

    this.coberturasForm = this.fb.group({
      tipoSeguro: ['', Validators.required],
      fechaInicio: [null, [Validators.required, this.fechaMinimaValidator()]],
      periodicidad: [null, Validators.required]
    });

    this.pagoForm = this.fb.group({
      tipoPago: [null],
      monto: [null],
      fechaPago: [null]
    });

    this.documentosForm = this.fb.group({
      documentos: [null]
    });
  }

  getLabelTipoPago(): string {
    const valor = this.pagoForm.get('tipoPago')?.value;
    const tipo = this.tiposPago.find(tp => tp.value === valor);
    return tipo?.label || '-';
  }

  ngOnInit(): void {
    this.cargarTiposSeguro();

    this.coberturasForm.get('fechaInicio')?.valueChanges.subscribe(fechaInicio => {
      this.pagoForm.patchValue({
        fechaPago: fechaInicio
      });
    });
  }

  formatoFecha(fecha: Date | null): string | null {
    if (fecha === null) {
      return null;
    }
    return fecha.toISOString().split('T')[0]; // Ejemplo de formato
  }

  cargarTiposSeguro() {
    this.segurosService.getAll().subscribe({
      next: (data) => this.tiposSeguro = data,
      error: (err) => console.error('Error al cargar tipos de seguro', err)
    });
  }

  onTipoSeguroSeleccionado(seguroSeleccionado: any) {
    if (seguroSeleccionado && seguroSeleccionado.paymentPeriod) {
      const periodoTraducido = this.traducirPeriodo(seguroSeleccionado.paymentPeriod);

      const fechaInicio = this.coberturasForm.get('fechaInicio')?.value;

      this.coberturasForm.patchValue({
        periodicidad: periodoTraducido
      });

      this.pagoForm.patchValue({
        tipoPago: periodoTraducido,
        monto: seguroSeleccionado.paymentAmount,
        fechaPago: fechaInicio || null
      });
    }
  }

  traducirPeriodo(periodo: string): string {
    switch (periodo) {
      case 'MONTHLY': return 'Mensual';
      case 'YEARLY': return 'Anual';
      default: return periodo;
    }
  }

  agregarBeneficiario() {
    this.beneficiarios.push({ nombre: '', parentesco: '', porcentaje: 0 });
  }

  eliminarBeneficiario(benef: any) {
    this.beneficiarios = this.beneficiarios.filter(b => b !== benef);
  }
  async finalizarProceso() {
    if (!this.clienteForm.valid || !this.coberturasForm.valid || !this.pagoForm.valid || !this.documentosForm.valid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Error',
        detail: 'Todos los campos obligatorios deben estar llenos.'
      });
      return;
    }

    if (this.uploadedFiles.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Error',
        detail: 'Debe subir al menos un documento.'
      });
      return;
    }

    try {
      const clientData = await firstValueFrom(this.clientService.getByIdentificationNumber(this.clienteForm.get('cedula')?.value));

      // 1. Guardar firma (datos simulados)
      const fakeSignature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // ejemplo estático
      const signatureData = {
        signature: fakeSignature.buffer,
        expirationDate: '2025-12-31', // fecha estática
        clientId: clientData?.id ?? undefined
      };

      this.contractService.saveSignature(signatureData).subscribe({
        next: () => console.log('Firma guardada correctamente'),
        error: (err) => console.error('Error al guardar firma:', err)
      });

      // 2. Guardar contrato
      const contractData: Contract = {
        startDate: this.formatoFecha(this.coberturasForm.get('fechaInicio')?.value) ?? undefined,
        status: 'ACTIVE',// Simulación de firma
        amountPaid: this.pagoForm.get('monto')?.value || 0,
        beneficiary: this.beneficiarios.map(b => b.nombre).join(', ') || '',
        insuranceId: this.coberturasForm.get('tipoSeguro')?.value?.id || null,
        clientId: clientData?.id ?? undefined,
        isActive: true 
      };

      const response = await firstValueFrom(this.contractService.create(contractData));
      const contractId = response.id;
      if (!contractId) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'ID de contratación no recibido del servidor.'
        });
        return;
      }

      // 3. Guardar datos relacionados
      this.saveRelatedData(contractId);

      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Contratación guardada con éxito.'
      });

      this.resetForms();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Hubo un problema al guardar la contratación.'
      });
      console.error(error);
    }
  }


  private saveRelatedData(contractId: string) {
    const paymentData = {
      contractId: contractId,
      date: this.formatoFecha(this.pagoForm.get('fechaPago')?.value),
      amount: this.pagoForm.get('monto')?.value,
      paymentMethod: this.pagoForm.get('tipoPago')?.value,
      processedBy: 'system'
    };

    const documentData = this.uploadedFiles.map(file => ({
      fileName: file.name,
      fileData: file
    }));

    const beneficiaryData = this.beneficiarios.map(benef => ({
      name: benef.nombre,
      relationship: benef.parentesco,
      percentage: benef.porcentaje
    }));

    // Assuming additional endpoints or methods in ContratacionesService for related data
    this.contractService.savePayment(paymentData).subscribe({
      error: (err) => console.error('Error saving payment:', err)
    });

    this.contractService.uploadDocuments(documentData, contractId).subscribe({
      error: (err) => console.error('Error uploading documents:', err)
    });

    this.contractService.saveBeneficiaries(beneficiaryData, contractId).subscribe({
      error: (err) => console.error('Error saving beneficiaries:', err)
    });
  }

  buscarCliente() {
    const cedula = this.clienteForm.get('buscar')?.value;

    if (!cedula || cedula.length < 10) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La cédula debe tener al menos 10 dígitos'
      });
      this.resetCampos(cedula);
      return;
    } else {
      const esInvalida = !validarCedulaEcuatoriana()(this.clienteForm.get('buscar')!);
      if (!esInvalida) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Cédula inválida',
          detail: 'La cédula ingresada no es válida'
        });
        this.resetCampos(cedula);
        return;
      }
    }

    this.clientService.getByIdentificationNumber(cedula).subscribe({
      next: (data) => {
        if (data) {
          this.clienteForm.patchValue({
            cedula: data.identificationNumber,
            nombres: data.name,
            apellidos: data.lastName,
            fechaNacimiento: new Date(data.birthDate),
            genero: data.gender,
            telefono: data.phoneNumber,
            correo: data.user.email,
            direccion: data.address,
            ocupacion: data.occupation,
          });

          this.messageService.add({
            severity: 'success',
            summary: 'Cliente encontrado',
            detail: 'Cliente encontrado con éxito'
          });

          this.clienteEncontrado = true;
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Cliente no encontrado',
            detail: 'No se encontró un cliente con esa cédula'
          });
          this.clienteEncontrado = false;
          this.resetCampos(cedula);
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se encontró un cliente con esa cédula'
        });
        this.clienteEncontrado = false;
        this.resetCampos(cedula);
      }
    });
  }

  esCedulaInvalida(): boolean {
    const control = this.clienteForm.get('cedula');
    return !!(control?.touched && control?.errors?.['cedulaInvalida']);
  }

  siguientePaso() {
    if (this.activeIndex === 1) {
      if (this.clienteForm.valid && this.clienteEncontrado) {
        this.activeIndex = 1;
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Datos incompletos',
          detail: 'Debe llenar todos los campos obligatorios y buscar el cliente antes de continuar.'
        });
        this.activeIndex = 0;
      }
    } else if (this.activeIndex === 2) {
      if (this.coberturasForm.valid) {
        this.activeIndex = 2;
      } else {
        this.messageService.add({
          severity: 'warn',
          summary: 'Datos incompletos',
          detail: 'Debe llenar todos los campos obligatorios antes de continuar.'
        });
        this.activeIndex = 2;
      }
    }
  }

  fechaMinimaValidator() {
    return (control: any) => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fecha = control.value;

      if (fecha && new Date(fecha) < hoy) {
        return { fechaPasada: true };
      }
      return null;
    };
  }

  rangoFechasValidator() {
    return (group: FormGroup) => {
      const inicio = group.get('fechaInicio')?.value;
      const fin = group.get('fechaFin')?.value;

      if (inicio && fin && new Date(fin) < new Date(inicio)) {
        return { rangoInvalido: true };
      }

      return null;
    };
  }

  validarBeneficiarios(): boolean {
    for (const benef of this.beneficiarios) {
      if (!benef.nombre.trim() || !benef.parentesco || benef.porcentaje === null || benef.porcentaje === undefined) {
        return false;
      }
    }
    return true;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        console.log(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  onUpload(event: any) {
    const archivo = event.files[0];
    if (archivo) {
      this.uploadedFiles = [archivo];
      this.mostrarError = false;
      this.messageService.add({
        severity: 'info',
        summary: 'Archivo subido',
        detail: archivo.name
      });
    }
  }

  removeFile(file: File) {
    this.uploadedFiles = this.uploadedFiles.filter(f => f !== file);
    this.messageService.add({
      severity: 'warn',
      summary: 'Archivo eliminado',
      detail: file.name
    });
  }

  validarDocumento() {
    const documentos: DocumentoRequerido[] = this.documentosForm.get('documentos')?.value || [];
    let error = false;

    for (const doc of documentos) {
      if (!doc.archivo) {
        doc.error = 'El archivo es requerido';
        error = true;
      } else {
        doc.error = '';
      }
    }

    this.mostrarError = error;
  }

  resetCampos(cedula: string): void {
    this.clienteForm.reset({
      buscar: cedula,
      cedula: '',
      nombres: '',
      apellidos: '',
      fechaNacimiento: null,
      genero: '',
      telefono: '',
      correo: '',
      ocupacion: '',
      direccion: ''
    });
  }

   resetForms() {
    this.clienteForm.reset();
    this.coberturasForm.reset();
    this.pagoForm.reset();
    this.documentosForm.reset();
    this.uploadedFiles = [];
    this.beneficiarios = [{ nombre: '', parentesco: '', porcentaje: 100 }];
    this.activeIndex = 0;
  }
}