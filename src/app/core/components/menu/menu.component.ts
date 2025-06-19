import { Component, inject } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { IMenu, MenuService } from '../../services/menu.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [MenubarModule, CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  listMenu: IMenu[];
  menuSrv = inject(MenuService);

  constructor() {
    this.listMenu = this.menuSrv.getMenu();
  }

  get currentUrl(): string {
    return window.location.pathname;
  }
}
