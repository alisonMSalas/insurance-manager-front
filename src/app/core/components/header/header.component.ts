import { Component, inject, Input, OnInit,ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule, Menu } from 'primeng/menu';
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
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
    @ViewChild('menu') menu!: Menu;
  private readonly router = inject(Router);
  @Input() pageTitle= 'Gestión de Seguros'; 
  @Input() pageSubtitle = 'Administra y revisa todas las pólizas de seguros'; 
  searchQuery= '';
  user = {
    name: 'Usuario',
    role: 'Agente de Seguros',
    icon: 'pi pi-user',
  };
  

  menuItems: MenuItem[] = [
    { label: 'Cerrar Sesión', icon: 'pi pi-sign-out', command: (event) => this.logout() }
  ];

  constructor(private readonly apiClient: ApiClientService) { }

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
  onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    this.menu.toggle(event); 
  }
}

}
