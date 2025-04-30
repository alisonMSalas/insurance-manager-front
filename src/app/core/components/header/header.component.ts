import { Component, EventEmitter, inject, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { ApiClientService } from '../../api/httpclient';

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
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  @Input() pageTitle: string = 'Gestión de Seguros'; // Título dinámico
  @Input() pageSubtitle: string = 'Administra y revisa todas las pólizas de seguros'; // Subtítulo dinámico

  searchQuery: string = '';

  user = {
    name: 'Usuario',
    icon: 'pi pi-user',
  };

  menuItems: MenuItem[] = [
    { label: 'Cerrar Sesión', icon: 'pi pi-sign-out', command: () => this.logout() }
  ];

  constructor(private apiClient: ApiClientService) { }

  ngOnInit() {
    const email = this.apiClient.getCurrentUserEmail();
    if (email) {
      this.user.name = email;
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
