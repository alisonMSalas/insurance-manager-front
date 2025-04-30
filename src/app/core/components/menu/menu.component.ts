import { Component,inject } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { IMenu } from '../../services/menu.service';
import { MenuService } from '../../services/menu.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-menu',
  imports: [MenubarModule,CommonModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  listMenu: IMenu[];
  menuSrv = inject(MenuService);
  constructor() {
    this.listMenu = this.menuSrv.getMenu();}
}
