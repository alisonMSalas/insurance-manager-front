import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { forkJoin, Observable } from 'rxjs';
import { RefundService } from '../core/services/refund.service';
import { ContratacionesService } from '../core/services/contrataciones.service';
import { Refund, RefundStatus } from '../shared/interfaces/refund';
import { Contract } from '../shared/interfaces/contract';
import { AttachmentType } from '../shared/interfaces/attachment';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
@Component({
  selector: 'app-reembolso-listado',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    ToastModule,
    ChipModule,
    DividerModule,
    DialogModule,
    FileUploadModule,
    InputTextModule,
    DropdownModule,
    FloatLabelModule,
    MessageModule,
    FormsModule,
    SelectModule, InputNumberModule
  ],
  templateUrl: './reembolso-listado.html',
  styleUrls: ['./reembolso-listado.scss']
})
export class ReembolsoListadoComponent implements OnInit {
  private refundService = inject(RefundService);
  private contratacionesService = inject(ContratacionesService);
  private messageService = inject(MessageService);
  private sanitizer = inject(DomSanitizer);

  reembolsos: Refund[] = [];
  userRole: string | null = null;
  modalVisible = false;
  reembolsoSeleccionado: Refund | null = null;
  crearModalVisible = false;
  newRefund: Refund = {
    refundType: '',
    description: '',
    observation: '',
    amountPaid: null,
    coveredAmount: 0,
    contractId: '',
    attachments: [],
    status: 'NEW' as RefundStatus,
    date: new Date().toISOString()
  };
  contracts: Contract[] = [];
  pendingFiles: File[] = [];
  formSubmitted = false;
  rechazarModalVisible = false;
  rejectReason = '';
  rechazoFormSubmitted = false;
  reembolsoSeleccionadoParaRechazo: Refund | null = null;
filtroTipo: string = '';
filtroEstado: string = '';


  ngOnInit(): void {
    this.userRole = this.getUserRole();
    this.cargarReembolsos();
    this.cargarContratos();
  }


estados = [
  { label: 'Todos los estados', value: '' },
  { label: 'Nuevo', value: 'NEW' },
  { label: 'Aprobado', value: 'APPROVED' },
  { label: 'Rechazado', value: 'REJECTED' }
];

reembolsosFiltrados() {
  return this.reembolsos.filter(r => {
    const cumpleTipo = this.filtroTipo
      ? r.refundType?.toLowerCase().includes(this.filtroTipo.toLowerCase())
      : true;

    const cumpleEstado = this.filtroEstado
      ? r.status?.toLowerCase() === this.filtroEstado.toLowerCase()
      : true;

    return cumpleTipo && cumpleEstado;
  });
}

  cargarReembolsos(): void {
    this.refundService.getAll().subscribe({
      next: (reembolsos) => {
        const observables: Observable<Contract>[] = reembolsos.map(reembolso =>
          this.contratacionesService.getById(reembolso.contractId)
        );
        forkJoin(observables).subscribe({
          next: (contracts) => {
            this.reembolsos = reembolsos.map((reembolso, index) => ({
              ...reembolso,
              contract: contracts[index]
            }));
          },
          error: (err) => {
            console.error('Error al cargar contratos:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudieron cargar los datos de contratos.'
            });
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar reembolsos:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los reembolsos.'
        });
      }
    });
  }

  cargarContratos(): void {
    this.contratacionesService.getAll().subscribe({
      next: (contracts) => {
        this.contracts = contracts.map(c => ({
          ...c,
          label: `${c.insurance ? c.insurance.name : ''} - ${c.client ? c.client.lastName : ''} ${c.client ? c.client.name : ''}`
        }));
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los contratos.'
        });
        console.error('Error al cargar contratos:', err);
      }
    });
  }

  formatFecha(fecha: string | undefined): string {
    if (!fecha) return '-';
    return formatDate(fecha, 'dd/MM/yyyy', 'en-US');
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'NEW': return 'Nuevo';
      case 'APPROVED': return 'Aprobado';
      case 'REJECTED': return 'Rechazado';
      default: return status;
    }
  }

  canCreateRefund(): boolean {
    return ['ADMIN', 'AGENT', 'CLIENT'].includes(this.userRole || '');
  }

  canViewRefunds(): boolean {
    return ['ADMIN', 'AGENT', 'CLIENT'].includes(this.userRole || '');
  }

  canProcessRefund(): boolean {
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

  abrirModalCrear(): void {
    this.newRefund = {
      refundType: '',
      description: '',
      observation: '',
      amountPaid: null,
      coveredAmount: 0,
      contractId: '',
      attachments: [],
      status: 'NEW',
      date: new Date().toISOString()
    };
    this.pendingFiles = [];
    this.formSubmitted = false;
    this.crearModalVisible = true;
  }

  onSelectedFiles(event: any): void {
    const files: File[] = event.files;
    if (this.pendingFiles.length + files.length > 3) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Límite Excedido',
        detail: 'No se pueden adjuntar más de 3 archivos.'
      });
      return;
    }
    this.pendingFiles = [...this.pendingFiles, ...files];
  }

  removePendingFile(index: number): void {
    this.pendingFiles.splice(index, 1);
  }

  async guardarReembolso(): Promise<void> {
    this.formSubmitted = true;
    if (
      !this.newRefund.refundType ||
      !this.newRefund.description ||
      !this.newRefund.contractId ||
      this.newRefund.amountPaid == null || this.newRefund.amountPaid <= 0
    ) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Complete todos los campos obligatorios con valores válidos.'
      });
      return;
    }

    try {
      this.newRefund.attachments = await Promise.all(
        this.pendingFiles.map(async (file) => {
          const base64 = await this.fileToBase64(file);
          return {
            content: base64.split(',')[1],
            fileName: file.name,
            attachmentType: file.type.includes('pdf') ? 'REFUND_REQUEST' as AttachmentType : 'REFUND_REQUEST' as AttachmentType
          };
        })
      );

      this.refundService.create(this.newRefund).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Reembolso creado correctamente.'
          });
          this.crearModalVisible = false;
          this.cargarReembolsos();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message || err?.error?.detail || 'No se pudo crear el reembolso.'
          });
          console.error('Error al crear reembolso:', err);
        }
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al procesar los archivos adjuntos.'
      });
      console.error('Error al procesar archivos:', error);
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFilePreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  mostrarModalReembolso(reembolso: Refund): void {
    this.reembolsoSeleccionado = reembolso;
    this.modalVisible = true;
  }


  aprobarReembolso(reembolso: Refund): void {
    if (reembolso.id) {
      this.refundService.approve(reembolso.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Reembolso aprobado correctamente.'
          });
          this.cerrarModal();
          this.cargarReembolsos();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo aprobar el reembolso.'
          });
          console.error('Error al aprobar reembolso:', err);
        }
      });
    }
  }

  cerrarModal(): void {
    this.modalVisible = false;
    this.crearModalVisible = false;
    this.reembolsoSeleccionado = null;
  }

  mostrarModalRechazo(reembolso: Refund): void {
    this.reembolsoSeleccionadoParaRechazo = reembolso;
    this.rejectReason = '';
    this.rechazoFormSubmitted = false;
    this.rechazarModalVisible = true;
  }

  cancelarRechazo(): void {
    this.rechazarModalVisible = false;
    this.reembolsoSeleccionadoParaRechazo = null;
    this.rejectReason = '';
    this.rechazoFormSubmitted = false;
  }

  confirmarRechazo(): void {
    this.rechazoFormSubmitted = true;
    if (!this.rejectReason) {
      return;
    }
    if (this.reembolsoSeleccionadoParaRechazo?.id) {
      this.refundService.reject(this.reembolsoSeleccionadoParaRechazo.id, this.rejectReason).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Reembolso rechazado correctamente.'
          });
          this.cerrarModal();
          this.cargarReembolsos();
          this.cancelarRechazo();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo rechazar el reembolso.'
          });
          console.error('Error al rechazar reembolso:', err);
        }
      });
    }
  }
  sanitizarBase64Image(base64: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/jpeg;base64,${base64}`);
  }
  esPDF(fileName: string): boolean {
    return fileName?.toLowerCase().endsWith('.pdf');
  }
   sanitizarBase64Pdf(base64: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`data:application/pdf;base64,${base64}`);
  }


}
