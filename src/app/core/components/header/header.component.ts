import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
@Component({
  selector: 'app-header',
  imports: [CommonModule,
    FormsModule,
    AvatarModule,
    InputTextModule,
    MenuModule,
    ButtonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Input() pageTitle: string = 'Gestión de Pólizas'; // Título dinámico
  @Input() pageSubtitle: string = 'Administra y revisa todas las pólizas de seguros'; // Subtítulo dinámico

  searchQuery: string = ''; // Valor de la búsqueda

  user = {
    name: 'Carlos Mendoza',
    role: 'Agente de Seguros',
    avatar: 'https://via.placeholder.com/40'
  };

  menuItems: MenuItem[] = [
    
    { label: 'Cerrar Sesión', icon: 'pi pi-sign-out', command: () => this.logout() }
  ];

  navigateToProfile() {
    console.log('Navegando al perfil');
  }

  navigateToSettings() {
    console.log('Navegando a configuración');
  }

  logout() {
    console.log('Cerrando sesión');
  }
}
