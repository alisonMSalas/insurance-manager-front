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
  styleUrls: ['./contratacion-seguros.component.css'], // corregido el typo
  providers: [MessageService]
})
export class ContratacionSegurosComponent {
  private segurosService = inject(SegurosService);
  private messageService = inject(MessageService);

  clienteForm: FormGroup;
  coberturasForm: FormGroup;
  pagoForm: FormGroup;
  documentosForm: FormGroup;

  tiposSeguro: any[] = [];
  uploadedFiles: File[] = [];
  mostrarError: boolean = false;

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

  // Catálogos
  tiposDocumento = [
    { label: 'DNI', value: 'dni' },
    { label: 'Pasaporte', value: 'pasaporte' },
    { label: 'RUC', value: 'ruc' },
    { label: 'Carnet de Extranjería', value: 'ce' }
  ];

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

  provincias = [
    { label: 'Provincia 1', value: 'p1' },
    { label: 'Provincia 2', value: 'p2' }
  ];

  distritos = [
    { label: 'Distrito 1', value: 'd1' },
    { label: 'Distrito 2', value: 'd2' }
  ];

  estadosCiviles = [
    { label: 'Soltero/a', value: 'soltero' },
    { label: 'Casado/a', value: 'casado' },
    { label: 'Divorciado/a', value: 'divorciado' }
  ];

  departamentos = [
    { label: 'Departamento A', value: 'a' },
    { label: 'Departamento B', value: 'b' }
  ];

  generos = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' }
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
      genero: [null],
      estadoCivil: [null],
      telefono: [''],
      correo: [''],
      direccion: [''],
      departamento: [null],
      provincia: [null],
      distrito: [null]
    });

    this.coberturasForm = this.fb.group({
      tipoSeguro: ['']
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

  ngOnInit(): void {
    this.cargarTiposSeguro();
  }

  cargarTiposSeguro() {
    this.segurosService.getAll().subscribe({
      next: (data) => this.tiposSeguro = data,
      error: (err) => console.error('Error al cargar tipos de seguro', err)
    });
  }

  agregarBeneficiario() {
    this.beneficiarios.push({ nombre: '', parentesco: '', porcentaje: 0 });
  }

  eliminarBeneficiario(benef: any) {
    this.beneficiarios = this.beneficiarios.filter(b => b !== benef);
  }

  finalizarProceso() {
    // TODO: lógica de guardado final
  }

  buscarCliente() {
    // TODO: implementar búsqueda de cliente
  }

  esCedulaInvalida(): boolean {
    const control = this.clienteForm.get('cedula');
    return !!(control?.touched && control?.errors?.['cedulaInvalida']);
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
    
}
