import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ContratacionesService } from '../../../core/services/contrataciones.service';
import { Contract } from '../../../shared/interfaces/contract';
import { SegurosService } from '../../service/seguros.service';
import { Insurance } from '../../../shared/interfaces/insurance';
import { Client } from '../../../shared/interfaces/client';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.css']
})
export class ResumenComponent {
  @Input() contratoId: string = '';
  segurosService = inject(SegurosService);



  ngOnInit() {
    this.getContractById();

  }
  contractService = inject(ContratacionesService);

  contract: Contract | null = null;
  policy: Insurance | null = null;
  client: Client | null = null;
  benefits: { id: string; name: string; description: string }[] = [];
  //   getContractById() {
  //   this.contractService.getById('8b417e2d-1114-4101-9702-e1d99479ca11').subscribe({
  //     next: (data) => {
  //       console.log('Contrato recibido:', data);
  //       this.contract = data;

  //       // Si el contrato tiene un insuranceId, hacemos la llamada
  //       const insuranceId = data.insuranceId;
  //       if (insuranceId) {
  //         this.segurosService.getById(insuranceId).subscribe({
  //           next: (insuranceData) => {
  //             console.log('Seguro recibido:', insuranceData);
  //             this.policy = insuranceData;
  //           },
  //           error: (error) => {
  //             console.error('Error al obtener el seguro:', error);
  //           }
  //         });
  //       } else {
  //         console.warn('El contrato no contiene un insuranceId.');
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error al obtener el contrato:', error);
  //     }
  //   });
  // }


  // contract = {
  //   "startDate": "2025-06-01",
  //   "insuranceId": "393edc74-c2ad-4448-993d-7858bb3d4ffd",
  //   "clientId": "b35829b3-efe3-467b-a2c4-5f608df650b4",
  //   "beneficiaries": [
  //     {
  //       "name": "Ana",
  //       "lastName": "Pérez",
  //       "identificationNumber": "1234567890",
  //       "phoneNumber": "0987654321"
  //     },
  //     {
  //       "name": "Luis",
  //       "lastName": "Gómez",
  //       "identificationNumber": "0987654321",
  //       "phoneNumber": "0991122334"
  //     }
  //   ]
  // };

  // policy = {
  //   "name": "Seguro Healthy FRAM",
  //   "type": "HEALTH",
  //   "description": "Cobertura completa para emergencias médicas y hospitalización.",
  //   "coverage": 50000.0,
  //   "deductible": 200.0,
  //   "paymentAmount": 120.0,
  //   "paymentPeriod": "MONTHLY",
  //   "benefits": [
  //     {
  //       "id": "17632ca4-b3dd-4de6-a203-7772ccfdd7c3"
  //     },
  //     {
  //       "id": "1f22bfbd-3764-40b9-9431-c232732b6317"
  //     }
  //   ],
  //   "active": true
  // };

  getContractById() {
    if (!this.contratoId) {
      console.warn('No se recibió contratoId como @Input');
      return;
    }

    console.log('Obteniendo contrato con ID:', this.contratoId);

    this.contractService.getById(this.contratoId).subscribe({
      next: (data) => {
        console.log('Contrato recibido:', data);
        this.contract = data;
        this.policy = data.insurance!;
        this.client = data.client!;
        this.benefits = data.insurance?.benefits || [];
      },
      error: (error) => {
        console.error('Error al obtener el contrato:', error);
      }
    });
  }
  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'ACTIVE':
        return 'active';
      case 'PENDING':
        return 'pending';
      case 'CANCELLED':
        return 'cancelled';
      case 'REJECTED_BY_CLIENT':
        return 'rejected';
      case 'EXPIRED':
        return 'expired';
      default:
        return '';
    }
  }


  getRolName(rol: string): string {
    const roles: { [key: string]: string } = {
      'CLIENT': 'Cliente',
      'ADMIN': 'Administrador',
      'AGENT': 'Agente'
    };
    return roles[rol] || rol;
  }

  getPolicyTypeName(type: string): string {
    const types: { [key: string]: string } = {
      'HEALTH': 'Salud',
      'LIFE': 'Vida',
      'AUTO': 'Auto'
    };
    return types[type] || type;
  }

  getPaymentPeriodName(period: string): string {
    const periods: { [key: string]: string } = {
      'MONTHLY': 'Mensual',
      'QUARTERLY': 'Trimestral',
      'YEARLY': 'Anual'
    };
    return periods[period] || period;
  }

  
}