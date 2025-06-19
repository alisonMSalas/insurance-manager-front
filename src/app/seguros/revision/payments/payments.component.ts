import { Component, inject, Input, OnInit } from '@angular/core';
import { ContratacionesService } from '../../../core/services/contrataciones.service';
import { Contract } from '../../../shared/interfaces/contract';
import { Insurance } from '../../../shared/interfaces/insurance';
import { Client } from '../../../shared/interfaces/client';
import { PaymentsService } from '../../service/payments.service';
import { ButtonModule } from 'primeng/button';
import { PaymentUrl } from '../../../shared/interfaces/payment-url-dto';
import { CardModule } from 'primeng/card';
import { CommonModule } from '@angular/common';
import { Pipe } from '@angular/core';
import { ContractStep } from '../../../shared/interfaces/contract-step';


@Component({
  selector: 'app-payments',
  imports: [ButtonModule, CardModule, CommonModule],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent implements OnInit {
  @Input() contratoId: string = '';

  contractService = inject(ContratacionesService);
  paymentsService = inject(PaymentsService)
  contract: Contract | null = null;

  policy: Insurance | null = null;
  client: Client | null = null;

  contractStep=ContractStep 
  ngOnInit(): void {
  this.getContractById();

  // Si vuelves de un pago, puedes usar query params o localStorage para detectarlo
  const urlParams = new URLSearchParams(window.location.search);
  const pagoExitoso = urlParams.get('pago') === 'exitoso';

  if (pagoExitoso) {
    // Simula recarga de contrato actualizado
    setTimeout(() => {
      this.getContractById();
    }, 1000); // espera un momento por si el backend tarda
  }
}
  getContractById() {
    if (!this.contratoId) {
      console.warn('No se recibió contratoId como @Input');
      return;
    }

    this.contractService.getById(this.contratoId).subscribe({
      next: (data) => {
        this.contract = data;
        this.policy = data.insurance!;
        this.client = data.client!;

      },
      error: (error) => {
        console.error('Error al obtener el contrato:', error);
      }
    });
  }

iniciarPago() {
  this.paymentsService.createCheckoutSession(this.contratoId)
    .subscribe({
      next: (paymentUrl: PaymentUrl) => {
        // Puedes agregar un parámetro para saber que volverás de pago
        localStorage.setItem('esperandoPago', 'true');
        window.location.href = paymentUrl.url;
      },
      error: err => console.error('Error al iniciar sesión de pago', err)
    });
}
  getStatusClass(status: string): string {
    // Normaliza el nombre del estado para evitar problemas con mayúsculas/espacios
    const normalizedStatus = status.toLowerCase().trim().replace(/\s+/g, '-');
    return `status-${normalizedStatus}`;
  }
}
