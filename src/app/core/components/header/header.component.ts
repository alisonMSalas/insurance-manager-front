import { Component, EventEmitter, Input, Output,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
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
  @Input() pageTitle: string = 'Gestión de Seguros'; // Título dinámico
  @Input() pageSubtitle: string = 'Administra y revisa todas las pólizas de seguros'; // Subtítulo dinámico
 router = inject(Router);
  searchQuery: string = ''; // Valor de la búsqueda

  user = {
    name: 'Carlos Mendoza',
    role: 'Agente de Seguros',
    icon: 'pi pi-user',
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
    this.router.navigate(['login']);
  }
}
