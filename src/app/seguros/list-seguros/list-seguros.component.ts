import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-seguros',
  standalone: true,
  imports: [CardModule, ButtonModule, FormsModule, CommonModule],
  templateUrl: './list-seguros.component.html',
  styleUrl: './list-seguros.component.css'
})
export class ListSegurosComponent {
  seguros = [
    { nombre: 'Seguro de Vida', tipo: 'Vida', estado: 'Activo' },
    { nombre: 'Seguro Vehicular', tipo: 'Auto', estado: 'Inactivo' },
    { nombre: 'Seguro Médico', tipo: 'Salud', estado: 'Activo' },
  ];
  policies = [
    {
      id: 1,
      title: 'Seguro de Vida Plus',
      status: 'active',
      type: 'Vida',
      coverages: [
        'Muerte accidental e invalidez permanente',
        'Gastos médicos por accidente',
        'Indemnización por hospitalización',
        'Asistencia funeraria'
      ],
      premium: '$850 mensuales',
      duration: '1 año (renovable)',
      conditions: [
        'Edad máxima para contratar: 65 años',
        'Período de carencia: 30 días',
        'No cubre enfermedades preexistentes',
        'Exclusión por deportes extremos'
      ]
    },
    {
      id: 2,
      title: 'Protección Automotriz',
      status: 'active',
      type: 'Vehículo'
    },
    {
      id: 3,
      title: 'Salud Familiar',
      status: 'inactive',
      type: 'Salud'
    },
    {
      id: 4,
      title: 'Hogar Seguro Total',
      status: 'active',
      type: 'Hogar'
    },
    {
      id: 5,
      title: 'Protección Viajero',
      status: 'active',
      type: 'Viajes'
    },
    {
      id: 6,
      title: 'Negocio Protegido',
      status: 'inactive',
      type: 'Empresarial'
    }
  ];

  showPolicyDetails(policy: any) {
    // Aquí puedes implementar la lógica para mostrar los detalles
    console.log('Mostrar detalles de:', policy);
  }
}