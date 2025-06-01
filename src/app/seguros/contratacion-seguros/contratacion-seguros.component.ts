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
import { ConfirmationService, MessageService } from 'primeng/api';
import { SegurosService } from '../service/seguros.service';
import { ClientsService } from '../../core/services/clients.service';
import { ContratacionesService } from '../../core/services/contrataciones.service';
import { Contract } from '../../shared/interfaces/contract';
import { firstValueFrom } from 'rxjs';
import { validarCedulaEcuatoriana } from '../../shared/utils/cedula.util';
import { DividerModule } from 'primeng/divider';
import { Dialog } from 'primeng/dialog';
import { Client } from '../../shared/interfaces/client';
import { User } from '../../core/services/users.service';
import { ApiClientService } from '../../core/api/httpclient';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';

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
    ToastModule,
    DividerModule,
    Dialog,
    ConfirmDialogModule,
    CheckboxModule
  ],
  templateUrl: './contratacion-seguros.component.html',
  styleUrls: ['./contratacion-seguros.component.scss'],
  providers: [MessageService,ConfirmationService]
})
export class ContratacionSegurosComponent {
   segurosService = inject(SegurosService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
   // Inyectamos los servicios necesarios
  clientService = inject(ClientsService);
   contractService = inject(ContratacionesService);
     apiClientService = inject(ApiClientService);
 currentUserEmail: string | null = null;
 today: Date = new Date();
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
        this.beneficiarioForm = this.fb.group({
      cedula: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      parentesco: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.cargarTiposSeguro();
     this.currentUserEmail = this.apiClientService.getCurrentUserEmail();
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
  mostrarModal2: boolean = false;
  nuevoCliente: Client & { user: Partial<User> & { password?: string } } = {
    id: '',
    name: '',
    lastName: '',
    identificationNumber: '',
    birthDate: '',
    phoneNumber: '',
    address: '',
    gender: '',
    occupation: '',
    active: true,
    user: {
      id: '',
      name: '',
      email: '',
      rol: 'CLIENT',
      active: true,
     
    },
  };


 async buscarCliente() {
  const cedula = this.clienteForm.get('buscar')?.value;
  if (!cedula) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Ingrese una cédula' });
    return;
  }

  try {
  const data = await firstValueFrom(this.clientService.getByIdentificationNumber(cedula));
  
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

} catch (error) {
   const err = error as any;
  // Si error es 404, significa que no se encontró
  if (err.status === 404) {
    this.confirmationService.confirm({
      message: 'El cliente no existe. ¿Desea registrarlo?',
      header: 'Cliente no encontrado',
      icon: 'pi pi-user-plus',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.nuevoCliente = {
          id: '',
          name: '',
          lastName: '',
          identificationNumber: cedula,
          birthDate: '',
          phoneNumber: '',
          address: '',
          gender: '',
          occupation: '',
          active: true,
          user: {
            id: '',
            name: '',
            email: '',
            rol: 'CLIENT',
            active: true,
           
          },
        };
        this.mostrarModal2 = true;
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'No se creó el cliente.' });
      }
    });
  } else {
    this.resetCampos(cedula);
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al buscar cliente' });
  }
}

}
 guardarCliente(): void {
 
  this.nuevoCliente.user.name = this.nuevoCliente.name + ' ' + this.nuevoCliente.lastName;

  const payload = { ...this.nuevoCliente };

  this.clientService.create(payload).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cliente creado correctamente',
      });
      this.mostrarModal2 = false;
      
    },
    error: (err) => {
      console.error('Error al crear cliente:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: err?.error?.message || err?.error?.detail || 'No se pudo crear el cliente',
      });
    }
  });
}

  restrictToNumbers(event: Event, client: any, field: string): void {
    const input = event.target as HTMLInputElement;
    const cleanValue = input.value.replace(/[^0-9]/g, '');
    client[field] = cleanValue;
    input.value = cleanValue;
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


  // NUEVOS

   beneficiarioForm: FormGroup;
  beneficiarios: any[] = [];
  modalVisible: boolean = false;



  mostrarModal() {
    this.modalVisible = true;
    this.beneficiarioForm.reset();
  }

  cerrarModal() {
    this.modalVisible = false;
  }

  agregarBeneficiario() {
    if (this.beneficiarioForm.valid) {
      this.beneficiarios.push(this.beneficiarioForm.value);
      this.modalVisible = false;
    }
  }

  eliminarBeneficiario(b: any) {
    this.beneficiarios = this.beneficiarios.filter(ben => ben !== b);
  }
}