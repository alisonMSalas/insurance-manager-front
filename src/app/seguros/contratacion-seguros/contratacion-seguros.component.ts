import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { SegurosService } from '../service/seguros.service';
import { ClientsService } from '../../core/services/clients.service';
import { ContratacionesService } from '../../core/services/contrataciones.service';
import { Contract } from '../../shared/interfaces/contract';
import { firstValueFrom } from 'rxjs';
import { validarCedulaEcuatoriana } from '../../shared/utils/cedula.util';

@Component({
  selector: 'app-contratacion-seguros',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    TabsModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    TabViewModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    FileUploadModule,
    ToastModule
  ],
  templateUrl: './contratacion-seguros.component.html',
  styleUrls: ['./contratacion-seguros.component.css'],
  providers: [MessageService]
})
export class ContratacionSegurosComponent {
  private segurosService = inject(SegurosService);
  messageService = inject(MessageService);
  clientService = inject(ClientsService);
  private contractService = inject(ContratacionesService);

  clienteForm: FormGroup;
  coberturasForm: FormGroup;
  pagoForm: FormGroup;
  documentosForm: FormGroup;

  tiposSeguro: any[] = [];
  uploadedFiles: File[] = [];
  clienteEncontrado: boolean = false;
  activeIndex = 0;

  tiposPago = [
    { label: 'Efectivo', value: 'efectivo' },
    { label: 'Tarjeta de Crédito', value: 'tarjeta' },
    { label: 'Transferencia', value: 'transferencia' }
  ];

  periodicidades = [
    { label: 'Mensual', value: 'mensual' },
    { label: 'Trimestral', value: 'trimestral' },
    { label: 'Anual', value: 'anual' }
  ];

  constructor(private fb: FormBuilder) {
    this.clienteForm = this.fb.group({
      buscar: ['', [Validators.required, validarCedulaEcuatoriana()]],
      cedula: ['', [Validators.required, validarCedulaEcuatoriana()]],
      nombres: [''],
      apellidos: [''],
      fechaNacimiento: [null],
      genero: [''],
      telefono: [''],
      correo: [''],
      ocupacion: [''],
      direccion: ['']
    });

    this.coberturasForm = this.fb.group({
      tipoSeguro: ['', Validators.required],
      fechaInicio: [null, [Validators.required, this.fechaMinimaValidator()]],
      periodicidad: ['', Validators.required],
      beneficiario: ['', Validators.required]
    });

    this.pagoForm = this.fb.group({
      tipoPago: ['', Validators.required],
      monto: [0, [Validators.required, Validators.min(1)]],
      fechaPago: [null, Validators.required]
    });

    this.documentosForm = this.fb.group({
      documentos: [[]]
    });
  }

  ngOnInit(): void {
    this.cargarTiposSeguro();
    this.coberturasForm.get('fechaInicio')?.valueChanges.subscribe(fechaInicio => {
      this.pagoForm.patchValue({ fechaPago: fechaInicio });
    });
  }

  cargarTiposSeguro() {
    this.segurosService.getAll().subscribe({
      next: (data) => this.tiposSeguro = data,
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar tipos de seguro' });
        console.error(err);
      }
    });
  }

  onTipoSeguroSeleccionado(seguroSeleccionado: any) {
    if (seguroSeleccionado && seguroSeleccionado.paymentPeriod) {
      const periodoTraducido = this.traducirPeriodo(seguroSeleccionado.paymentPeriod);
      this.coberturasForm.patchValue({ periodicidad: periodoTraducido });
      this.pagoForm.patchValue({
        tipoPago: 'tarjeta',
        monto: seguroSeleccionado.paymentAmount || 0,
        fechaPago: this.coberturasForm.get('fechaInicio')?.value || null
      });
    }
  }

  traducirPeriodo(periodo: string): string {
    switch (periodo.toUpperCase()) {
      case 'MONTHLY': return 'mensual';
      case 'QUARTERLY': return 'trimestral';
      case 'YEARLY': return 'anual';
      default: return periodo;
    }
  }

  async buscarCliente() {
    const cedula = this.clienteForm.get('buscar')?.value;
    if (!cedula) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ingrese una cédula' });
      return;
    }

    try {
      const data = await firstValueFrom(this.clientService.getByIdentificationNumber(cedula));
      if (data) {
        this.clienteForm.patchValue({
          cedula: data.identificationNumber,
          nombres: data.name,
          apellidos: data.lastName,
          fechaNacimiento: new Date(data.birthDate),
          genero: data.gender,
          telefono: data.phoneNumber,
          correo: data.user?.email,
          ocupacion: data.occupation,
          direccion: data.address
        });
        this.clienteEncontrado = true;
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Cliente encontrado' });
      } else {
        this.resetCampos(cedula);
        this.messageService.add({ severity: 'warn', summary: 'No encontrado', detail: 'Cliente no encontrado' });
      }
    } catch (error) {
      this.resetCampos(cedula);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al buscar cliente' });
    }
  }

  async finalizarProceso() {
    if (!this.clienteForm.valid || !this.coberturasForm.valid || !this.pagoForm.valid ) {
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Complete todos los campos obligatorios' });
      return;
    }

    try {
      const clientData = await firstValueFrom(this.clientService.getByIdentificationNumber(this.clienteForm.get('cedula')?.value));
      const documentosRequeridos = 1;
    const estadoInicial = this.uploadedFiles.length >= documentosRequeridos ? 'PENDING' : 'REQUESTED';
      const contractData: Contract = {
        startDate: this.formatoFecha(this.coberturasForm.get('fechaInicio')?.value),
        status: estadoInicial,
        amountPaid: this.pagoForm.get('monto')?.value,
        beneficiary: this.coberturasForm.get('beneficiario')?.value,
        insuranceId: this.coberturasForm.get('tipoSeguro')?.value?.id,
        clientId: clientData?.id,
        isActive: true
      };

      const response = await firstValueFrom(this.contractService.create(contractData));
      if (!response.id) {
        throw new Error('ID de contrato no recibido');
      }

       if (this.uploadedFiles.length > 0) {
      const documentData = this.uploadedFiles.map(file => ({
        fileName: file.name,
        fileData: file
      }));
      await firstValueFrom(this.contractService.uploadDocuments(documentData, response.id));
    }

      this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Contratación guardada con éxito' });
      this.resetForms();
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al guardar la contratación' });
      console.error(error);
    }
  }

  formatoFecha(fecha: Date | null | undefined): string | undefined {
    return fecha ? fecha.toISOString().split('T')[0] : undefined;
  }

  onUpload(event: any) {
    this.uploadedFiles.push(...event.files);

    event.options.clear();

    this.documentosForm.patchValue({ documentos: this.uploadedFiles });
    this.messageService.add({
      severity: 'info',
      summary: 'Archivo(s) añadido(s)',
      detail: `${event.files.length} archivo(s) listo(s)`
    });
  }


  removeFile(file: File) {
    this.uploadedFiles = this.uploadedFiles.filter(f => f !== file);
    this.documentosForm.patchValue({ documentos: this.uploadedFiles });
    this.messageService.add({ severity: 'warn', summary: 'Archivo eliminado', detail: file.name });
  }

  siguientePaso() {
    if (this.activeIndex === 0 && !this.clienteForm.valid) {
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Complete los datos del cliente' });
      return;
    }
    if (this.activeIndex === 1 && !this.coberturasForm.valid) {
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Complete las coberturas y el beneficiario' });
      return;
    }
    // if (this.activeIndex === 2 && this.uploadedFiles.length === 0) {
    //   this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Suba al menos un documento' });
    //   return;
    //}
    if (this.activeIndex === 3 && !this.pagoForm.valid) {
      this.messageService.add({ severity: 'warn', summary: 'Error', detail: 'Complete los datos de pago' });
      return;
    }
    if (this.activeIndex < 4) {
      this.activeIndex++;
    }
  }

  fechaMinimaValidator() {
    return (control: any) => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const fecha = control.value;
      return fecha && new Date(fecha) < hoy ? { fechaPasada: true } : null;
    };
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
    this.clienteEncontrado = false;
  }

  resetForms() {
    this.clienteForm.reset();
    this.coberturasForm.reset();
    this.pagoForm.reset();
    this.documentosForm.reset();
    this.uploadedFiles = [];
    this.activeIndex = 0;
    this.clienteEncontrado = false;
  }
}